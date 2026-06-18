from __future__ import annotations

import os
import re
import json
from typing import Optional

import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-6"

MAX_HANDOFFS = int(os.environ.get("MAX_HANDOFFS", "3"))

NGO_MAP = {
    "legal_detention": "LHR (Lawyers for Human Rights)",
    "asylum": "Scalabrini Centre",
    "refugee_urgent": "UNHCR South Africa",
    "health_crisis": "SIHMA",
}

VALID_AGENTS = {"legal", "credit", "health", "education", "journey"}

AGENT_DISPLAY_NAMES = {
    "legal": "Lex",
    "credit": "Rex",
    "health": "Vita",
    "education": "Opportunity",
    "journey": "Journey Engine",
}

HANDOFF_INSTRUCTIONS = """

INTER-AGENT HANDOFF PROTOCOL:
You are one of several specialist agents working together within Kommune
(Lex/legal, Rex/credit, Vita/health, education, journey). If, while helping
the user, you identify that part of their issue falls clearly into another
agent's domain and would benefit from that agent's expertise in THIS SAME
reply, end your response with a handoff tag on its own line:

[[HANDOFF: <agent_name>]]

where <agent_name> is one of: legal, credit, health, education, journey.

Only do this if it genuinely adds value. Do NOT hand off for issues you can
fully answer yourself. Do NOT hand off back to an agent that has already
responded in this conversation turn. If no handoff is needed, simply do not
include the tag.
"""

EMERGENCY_INSTRUCTIONS = """

EMERGENCY DETECTION PROTOCOL:
If the user's message describes an ACTIVE emergency — they are currently
detained, about to be deported imminently (e.g. "they're putting me on a
plane", "I'm at the airport being deported now"), in immediate danger of
violence, or facing an urgent health crisis with no access to care RIGHT
NOW — begin your response with a tag on its own line, BEFORE any other
text:

[[EMERGENCY: <reason>]]

where <reason> is a short (2-6 word) description, e.g. "active detention"
or "imminent deportation". Only use this for genuinely urgent, time-critical
situations happening now — not for general questions about rights,
processes, or past events. Most messages should NOT trigger this.
"""

HANDOFF_PATTERN = re.compile(r"\[\[HANDOFF:\s*(\w+)\s*\]\]", re.IGNORECASE)
EMERGENCY_PATTERN = re.compile(r"\[\[EMERGENCY:\s*([^\]]+)\]\]", re.IGNORECASE)


def extract_handoff(text: str) -> tuple[str, Optional[str]]:
    """Strip the handoff tag from response text. Returns
    (clean_text, handoff_agent_or_None)."""
    match = HANDOFF_PATTERN.search(text)
    if not match:
        return text.strip(), None

    agent = match.group(1).lower()
    clean_text = HANDOFF_PATTERN.sub("", text).strip()

    if agent not in VALID_AGENTS:
        return clean_text, None

    return clean_text, agent


def extract_emergency(text: str) -> tuple[str, Optional[str]]:
    """Strip an emergency tag from response text. Returns
    (clean_text, reason_or_None)."""
    match = EMERGENCY_PATTERN.search(text)
    if not match:
        return text, None

    reason = match.group(1).strip()
    clean_text = EMERGENCY_PATTERN.sub("", text, count=1).strip()
    return clean_text, reason


def call_agent(
    system_prompt: str,
    messages: list[dict],
    max_tokens: int = 1024,
) -> str:
    """Call the Anthropic API and return concatenated text content."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=messages,
    )
    return "".join(block.text for block in response.content if block.type == "text")


def call_agent_with_tools(
    system_prompt: str,
    messages: list[dict],
    tools: list[dict],
    max_tokens: int = 1536,
    max_iterations: int = 5,
) -> tuple[str, list[dict]]:
    """Run an agentic tool-use loop: call Claude, execute any requested
    tools (web_search is executed server-side by Anthropic; other tools
    are dispatched via app.core.tools.registry.execute_tool), feed results
    back, and repeat until Claude responds with text only (or
    max_iterations is hit).

    Returns (final_text, tool_calls_log) where tool_calls_log is a list of
    {"tool": str, "input": dict, "result": dict} for non-search tools,
    used for Vault audit logging.
    """
    from app.core.tools.registry import execute_tool

    conversation = list(messages)
    tool_calls_log: list[dict] = []

    for _ in range(max_iterations):
        response = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=conversation,
            tools=tools if tools else None,
        )

        # Collect text and any client-side tool_use blocks (web_search is
        # handled server-side by Anthropic and returns server_tool_use /
        # web_search_tool_result blocks that don't need our dispatch).
        text_parts = []
        client_tool_uses = []

        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use" and block.name in ("send_email", "schedule_appointment"):
                client_tool_uses.append(block)

        final_text = "".join(text_parts)

        if response.stop_reason != "tool_use" or not client_tool_uses:
            return final_text, tool_calls_log

        # Execute client-side tools and append results
        conversation.append({"role": "assistant", "content": response.content})

        tool_results = []
        for tool_use in client_tool_uses:
            result = execute_tool(tool_use.name, tool_use.input)
            tool_calls_log.append(
                {"tool": tool_use.name, "input": tool_use.input, "result": result}
            )
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": json.dumps(result, default=str),
                }
            )

        conversation.append({"role": "user", "content": tool_results})

    return final_text, tool_calls_log
