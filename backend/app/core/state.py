from __future__ import annotations

import time
from typing import Any, Dict, List, Literal, Optional, TypedDict


try:
    # LangChain message type (optional import for type-hints only).
    from langchain_core.messages import BaseMessage  # type: ignore
except Exception:  # pragma: no cover
    BaseMessage = Any  # type: ignore


class KommuneState(TypedDict, total=False):
    """Shared state schema for the Kommune multi-agent LangGraph workflow.

    Contract:
    - Every agent reads required fields and writes updates back to this state.
    - The API layer should treat this as immutable input and produce a new state
      output (in practice, LangGraph reducers control merging behavior).

    Note: This project currently uses placeholders. This state definition is
    production-oriented and stable; LangGraph orchestration will be wired in
    subsequent steps.
    """

    # Identity / correlation
    session_id: str
    user_id: str  # phone number or internal user id

    # Gatekeeper / access control
    payment_status: bool
    gate_status: Literal[
        "UNVERIFIED",
        "PENDING",
        "ACTIVE",
        "LOCKED",
    ]

    # Emergency protocol
    emergency_triggered: bool
    emergency_reason: Optional[str]
    emergency_event_id: Optional[str]
    emergency_metadata: Optional[Dict[str, Any]]
    emergency_locked_at: Optional[float]

    # Agent I/O: LangChain message stream.
    # Agents should append to this stream.
    messages: List[BaseMessage]

    # Agent routing / orchestration
    next_agent: Optional[str]  # e.g. "legal" | "credit" | "education" | "resettlement" | "general"


    # Progress & results
    progress: Dict[str, Any]

    # Audit/Vault integration (immutable ledger)
    # Each agent action should be translated into Vault entries with SHA-256
    # hashes (see backend/app/core/vault/ledger.py).
    vault_entries: List[Dict[str, Any]]

    # Accumulated agent output for downstream UI/API responses
    artifacts: Dict[str, Any]

    # Housekeeping
    created_at: float
    updated_at: float


def now_ts() -> float:
    return time.time()


def new_state(*, session_id: str, user_id: str) -> KommuneState:
    """Create a minimal initial state instance."""

    t = now_ts()
    return {
        "session_id": session_id,
        "user_id": user_id,
        "payment_status": False,
        "gate_status": "UNVERIFIED",
        "emergency_triggered": False,
        "emergency_metadata": None,
        "next_agent": "router",
        "progress": {
            "phase": "INIT",
            "steps": [],
        },
        "vault_entries": [],
        "artifacts": {},
        "created_at": t,
        "updated_at": t,
    }

