from __future__ import annotations

"""LangGraph orchestration skeleton.

This module will wire:
- Legal agent
- Opportunity agent
- Credit agent
- Health agent

and enforce Vault-audited actions (immutable audit trail).

TODO:
- Define Pydantic IO contracts
- Build async LangGraph with clear orchestration flow
- Inject Vault service into nodes (dependency inversion)
"""

from dataclasses import dataclass

from app.core.agents.credit import run_credit_agent
from app.core.agents.health import run_health_agent
from app.core.agents.legal import run_legal_agent
from app.core.agents.opportunity import run_opportunity_agent
from app.core.state import KommuneState


@dataclass
class AgentGraphResult:
    status: str
    payload: dict


async def run_agent_graph(state: KommuneState) -> AgentGraphResult:
    """Run the Kommune multi-agent routing workflow.

    Current behavior (production-ready skeleton):
    - Implements a simple router based on `state.next_agent`.
    - Enforces emergency lock by returning early when `emergency_triggered=True`.

    Next steps:
    - Replace this with an actual `langgraph.graph.StateGraph` implementation.
    - Add Vault-audited read/write wrappers per agent action.
    - Implement Pydantic v2 IO models for strict validation.
    """

    # Emergency protocol: lock session (domain rule)
    if state.get("emergency_triggered"):
        return AgentGraphResult(
            status="EMERGENCY_LOCKED",
            payload={
                "locked": True,
                "event_id": state.get("emergency_event_id"),
                "checklist": state.get("artifacts", {}).get("rights_checklist"),
            },
        )

    route = state.get("next_agent") or "router"

    if route == "legal":
        result = await run_legal_agent({"state": state})
    elif route == "credit":
        result = await run_credit_agent({"state": state})
    elif route == "opportunity":
        result = await run_opportunity_agent({"state": state})
    elif route == "health":
        result = await run_health_agent({"state": state})
    else:
        # Default: no-op until router/supervisor is implemented.
        result = {"agent": "router", "status": "not_implemented", "next_agent": route}

    return AgentGraphResult(status="OK", payload={"result": result, "state": state})


