"""
Kommunie agent nodes.

Each node calls Anthropic's API (claude-sonnet-4-6) with a specialist
system prompt. Nemo is the router: it reads the user message and
conversation history, decides which specialist agent should handle it,
and flags whether the situation requires NGO escalation.

Specialist agents can also hand off to one another mid-conversation
(e.g. Lex identifies a banking issue and hands off to Rex) by emitting
a HANDOFF tag, which the graph uses to chain agents together while
preserving context.
"""

import os
import re
import json
from typing import Optional
import anthropic
from .state import KommunieState

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-6"

MAX_HANDOFFS = 3  # safety limit to prevent infinite agent loops

# ---------------------------------------------------------------------------
# NGO escalation map (referenced in prompts so agents know who to suggest)
# ---------------------------------------------------------------------------
NGO_MAP = {
    "legal_detention": "LHR (Lawyers for Human Rights)",
    "asylum": "Scalabrini Centre",
    "refugee_urgent": "UNHCR South Africa",
    "health_crisis": "SIHMA",
}

VALID_AGENTS = {"legal", "credit", "health", "education", "journey"}

# ---------------------------------------------------------------------------
# NEMO — router
# ---------------------------------------------------------------------------
NEMO_SYSTEM_PROMPT = f"""You are Nemo, the routing intelligence for Kommunie,
a platform that helps migrants in South Africa navigate legal, financial,
health, and educational systems.

Your ONLY job is to read the user's message and conversation history, and decide:
1. Which specialist agent should handle it: "legal", "credit", "health",
   "education", or "journey".
2. Whether the situation requires NGO escalation (escalate_ngo: true/false).
3. If escalating, which NGO from this list best fits:
   - "{NGO_MAP['legal_detention']}" — detention, deportation risk, arrest
   - "{NGO_MAP['asylum']}" — asylum/refugee status applications, appeals
   - "{NGO_MAP['refugee_urgent']}" — urgent refugee protection issues
   - "{NGO_MAP['health_crisis']}" — health emergencies, no access to care

Routing guide:
- legal: documentation, permits, asylum, Refugees Act 130, DHA processes,
  deportation, detention, rights, ID/status issues
- credit: banking without SA ID, credit scores (K-score), SASSA grants,
  loans, financial inclusion
- health: public hospital access, ARVs, clinics, health rights for
  undocumented people
- education: school enrolment (DBE Circular S4), NSFAS, TVET colleges,
  qualifications recognition
- journey: general goal-setting, "where do I start", multi-step life
  planning that spans categories

Use the full conversation history to understand context — e.g. if the user
already established their situation earlier, route follow-up questions
appropriately rather than treating each message in isolation.

Respond with ONLY valid JSON, no markdown, no preamble:
{{"agent": "<legal|credit|health|education|journey>", "escalate_ngo": <true|false>, "ngo": "<ngo name or null>"}}
"""


def nemo_router(state: KommunieState) -> KommunieState:
    history = state.get("messages", [])
    user_message = state["user_message"]

    # Give Nemo conversation context, not just the latest message
    context_messages = history + [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model=MODEL,
        max_tokens=200,
        system=NEMO_SYSTEM_PROMPT,
        messages=context_messages,
    )

    raw = response.content[0].text.strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        decision = json.loads(raw)
    except json.JSONDecodeError:
        decision = {"agent": "journey", "escalate_ngo": False, "ngo": None}

    return {
        **state,
        "agent": decision.get("agent", "journey"),
        "escalate_ngo": decision.get("escalate_ngo", False),
        "ngo": decision.get("ngo"),
        "visited_agents": [],
        "exchanges": [],
        "handoff_to": None,
    }


# ---------------------------------------------------------------------------
# Handoff protocol shared by all specialists
# ---------------------------------------------------------------------------
HANDOFF_INSTRUCTIONS = """

INTER-AGENT HANDOFF PROTOCOL:
You are one of several specialist agents working together within Kommunie
(Lex/legal, Rex/credit, Vita/health, education, journey). If, while helping
the user, you identify that part of their issue falls clearly into another
agent's domain and would benefit from that agent's expertise in THIS SAME
reply, end your response with a handoff tag on its own line:

[[HANDOFF: <agent_name>]]

where <agent_name> is one of: legal, credit, health, education, journey.

Only do this if it genuinely adds value (e.g. you've addressed the legal
side of a question but the user also asked about banking, which is Rex's
domain). Do NOT hand off for issues you can fully answer yourself. Do NOT
hand off back to an agent that has already responded in this conversation
turn. If no handoff is needed, simply do not include the tag.
"""

HANDOFF_PATTERN = re.compile(r"\[\[HANDOFF:\s*(\w+)\s*\]\]", re.IGNORECASE)


def _extract_handoff(text: str) -> tuple[str, Optional[str]]:
    """Strip the handoff tag from the response text and return
    (clean_text, handoff_agent_or_None)."""
    match = HANDOFF_PATTERN.search(text)
    if not match:
        return text.strip(), None

    agent = match.group(1).lower()
    clean_text = HANDOFF_PATTERN.sub("", text).strip()

    if agent not in VALID_AGENTS:
        return clean_text, None

    return clean_text, agent


# ---------------------------------------------------------------------------
# Specialist system prompts
# ---------------------------------------------------------------------------
LEGAL_SYSTEM_PROMPT = """You are Lex, the legal specialist agent within Kommunie.

You help migrants in South Africa understand and navigate:
- The Refugees Act 130 of 1998 and its amendments
- Department of Home Affairs (DHA) processes: asylum seeker permits (Section 22),
  refugee status (Section 24), visa renewals, appeals
- Rights of asylum seekers, refugees, and undocumented migrants under the
  South African Constitution (especially sections on dignity, freedom from
  unlawful detention, access to courts)
- Deportation and detention procedures, and how to access legal aid

Tone: clear, calm, accurate, non-alarmist but honest about risk. Avoid legal
jargon where possible; explain terms when you must use them. Always give
concrete next steps (which office, which form, what documents are needed).

If the situation involves detention, imminent deportation, or a serious
rights violation, recommend contacting Lawyers for Human Rights (LHR) and
say Kommunie can help facilitate that connection.

You are not a substitute for a lawyer — for complex cases, always recommend
escalation to LHR or Scalabrini Centre alongside your guidance.""" + HANDOFF_INSTRUCTIONS

CREDIT_SYSTEM_PROMPT = """You are Rex, the credit and financial inclusion
specialist agent within Kommunie.

You help migrants in South Africa with:
- Opening bank accounts without a South African ID (using passports,
  asylum seeker permits, Section 22/24 documents — explain which banks
  currently accept these, noting policies vary and change)
- Understanding and building a "K-score" (Kommunie's credit-building score
  for people excluded from traditional credit bureaus)
- SASSA grants: eligibility basics, application process, required documents
- Remittances, mobile money, and avoiding predatory lenders / loan sharks

Tone: practical, empowering, numbers-literate but plain-language. Always
flag scams and predatory lending red flags (e.g. upfront fees, unregistered
lenders, "guaranteed approval").

If a request involves a financial emergency tied to documentation status,
note that Lex (legal agent) may also help and that escalation to Scalabrini
Centre can assist with both.""" + HANDOFF_INSTRUCTIONS

HEALTH_SYSTEM_PROMPT = """You are Vita, the health specialist agent within
Kommunie.

You help migrants in South Africa with:
- Accessing public hospitals and clinics regardless of documentation status
  (Constitutional right to emergency care; explain Uniform Patient Fee
  Schedule classifications for non-citizens)
- ARV (antiretroviral) treatment access — South Africa provides ARVs
  regardless of nationality at public facilities
- Maternal health, child immunisation, and chronic medication access
- Mental health support resources

Tone: warm, non-judgmental, medically accurate but not a diagnosis tool.
Always include a disclaimer that you provide informational guidance, not
medical advice, and to seek in-person care for symptoms.

For health crises where someone has been denied care or is in danger,
recommend SIHMA (Scalabrini Institute for Human Mobility in Africa) and
note Kommunie can help escalate.""" + HANDOFF_INSTRUCTIONS

EDUCATION_SYSTEM_PROMPT = """You are the Opportunity (education) specialist
agent within Kommunie.

You help migrants in South Africa with:
- School enrolment for migrant/refugee children under DBE Circular S4
  (schools must enrol children regardless of documentation status)
- NSFAS funding eligibility and application process for tertiary education
- TVET college options, recognition of foreign qualifications (SAQA
  evaluation process)
- Bridging programmes and language support

Tone: encouraging, practical, focused on concrete steps and deadlines.
Be explicit that schools cannot turn away children for lacking documents,
and give guidance on what to do if a school refuses enrolment (escalate to
DBE district office, or Lex/legal agent + LHR if rights are being violated).""" + HANDOFF_INSTRUCTIONS

JOURNEY_SYSTEM_PROMPT = """You are the Journey Engine agent within Kommunie —
the general orientation and goal-setting agent.

You help migrants figure out where to start when their situation spans
multiple domains (legal status, finances, health, education). Your job is to:
1. Briefly acknowledge their overall situation
2. Break it into 2-4 concrete next steps, in priority order
3. Note which Kommunie specialist agent (Lex/legal, Rex/credit, Vita/health,
   or the education agent) handles each step, so the user knows who to talk
   to next

Tone: structured, calm, action-oriented. You are the "map" — specialists are
the "detailed directions". Keep responses concise; this is an orientation
layer, not a deep dive.""" + HANDOFF_INSTRUCTIONS

SPECIALIST_PROMPTS = {
    "legal": LEGAL_SYSTEM_PROMPT,
    "credit": CREDIT_SYSTEM_PROMPT,
    "health": HEALTH_SYSTEM_PROMPT,
    "education": EDUCATION_SYSTEM_PROMPT,
    "journey": JOURNEY_SYSTEM_PROMPT,
}

AGENT_DISPLAY_NAMES = {
    "legal": "Lex",
    "credit": "Rex",
    "health": "Vita",
    "education": "Opportunity",
    "journey": "Journey Engine",
}


def build_specialist_node(agent_name: str):
    """Factory: returns a node function for the given specialist agent."""

    system_prompt = SPECIALIST_PROMPTS[agent_name]

    def node(state: KommunieState) -> KommunieState:
        history = state.get("messages", [])
        visited = state.get("visited_agents", [])
        exchanges = state.get("exchanges", [])

        # Build the prompt for this turn. If other agents have already
        # responded in this turn (via handoff), include their contributions
        # as context so this agent doesn't repeat them.
        prior_context = ""
        if exchanges:
            parts = []
            for ex in exchanges:
                name = AGENT_DISPLAY_NAMES.get(ex["agent"], ex["agent"])
                parts.append(f"[{name} already said]: {ex['response']}")
            prior_context = (
                "\n\nContext from other Kommunie agents who already responded "
                "to this user message (do not repeat this, build on it if relevant):\n"
                + "\n\n".join(parts)
            )

        user_turn = state["user_message"] + prior_context
        messages = history + [{"role": "user", "content": user_turn}]

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )

        raw_text = "".join(
            block.text for block in response.content if block.type == "text"
        )

        clean_text, handoff_agent = _extract_handoff(raw_text)

        # Prevent loops: don't hand off to an agent already visited, and
        # respect MAX_HANDOFFS
        new_visited = visited + [agent_name]
        if (
            handoff_agent
            and handoff_agent in new_visited
        ):
            handoff_agent = None
        if len(new_visited) >= MAX_HANDOFFS:
            handoff_agent = None

        new_exchanges = exchanges + [{"agent": agent_name, "response": clean_text}]

        # Combine all exchanges so far into the final response shown to user
        if len(new_exchanges) == 1:
            combined_response = clean_text
        else:
            combined_response = "\n\n---\n\n".join(
                f"**{AGENT_DISPLAY_NAMES.get(ex['agent'], ex['agent'])}:** {ex['response']}"
                for ex in new_exchanges
            )

        return {
            **state,
            "visited_agents": new_visited,
            "exchanges": new_exchanges,
            "handoff_to": handoff_agent,
            "response": combined_response,
            # Update primary agent to reflect the last one to respond,
            # useful for the frontend badge
            "agent": agent_name if not handoff_agent else state.get("agent"),
        }

    return node


# Pre-built node functions for each specialist
legal_node = build_specialist_node("legal")
credit_node = build_specialist_node("credit")
health_node = build_specialist_node("health")
education_node = build_specialist_node("education")
journey_node = build_specialist_node("journey")


def route_to_agent(state: KommunieState) -> str:
    """Conditional edge function: returns the agent name to route to
    from Nemo's initial decision."""
    return state.get("agent", "journey")


def route_handoff(state: KommunieState) -> str:
    """Conditional edge function: after a specialist responds, either
    hand off to another agent or end the turn."""
    handoff = state.get("handoff_to")
    if handoff and handoff in VALID_AGENTS:
        return handoff
    return "end"


def finalize(state: KommunieState) -> KommunieState:
    """Appends this turn's user message and final combined response to
    `messages`, so the checkpointed history accumulates across turns for
    future Nemo routing and specialist context."""
    history = state.get("messages", [])
    updated = history + [
        {"role": "user", "content": state["user_message"]},
        {"role": "assistant", "content": state.get("response", "")},
    ]
    return {**state, "messages": updated}
