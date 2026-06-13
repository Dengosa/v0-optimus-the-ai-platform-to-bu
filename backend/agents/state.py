from typing import TypedDict, Optional, List, Literal

AgentName = Literal["legal", "credit", "health", "education", "journey"]


class AgentExchange(TypedDict):
    agent: AgentName
    response: str


class KommunieState(TypedDict, total=False):
    # Conversation
    messages: List[dict]  # [{"role": "user"|"assistant", "content": str}]
    user_message: str

    # Routing
    agent: Optional[AgentName]
    escalate_ngo: bool
    ngo: Optional[str]

    # Inter-agent handoff
    handoff_to: Optional[AgentName]
    visited_agents: List[AgentName]
    exchanges: List[AgentExchange]  # record of each agent's contribution

    # Output
    response: str

    # User context (optional, can be expanded later)
    user_id: Optional[str]
    locale: Optional[str]
