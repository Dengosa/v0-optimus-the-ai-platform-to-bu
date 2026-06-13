from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import KommunieState
from .nodes import (
    nemo_router,
    legal_node,
    credit_node,
    health_node,
    education_node,
    journey_node,
    route_to_agent,
    route_handoff,
    finalize,
)

SPECIALIST_AGENTS = ["legal", "credit", "health", "education", "journey"]
SPECIALIST_NODES = {
    "legal": legal_node,
    "credit": credit_node,
    "health": health_node,
    "education": education_node,
    "journey": journey_node,
}


def build_graph(checkpointer=None):
    graph = StateGraph(KommunieState)

    graph.add_node("nemo", nemo_router)
    for name, node_fn in SPECIALIST_NODES.items():
        graph.add_node(name, node_fn)
    graph.add_node("finalize", finalize)

    graph.set_entry_point("nemo")

    # Nemo decides which specialist handles the message first
    graph.add_conditional_edges(
        "nemo",
        route_to_agent,
        {agent: agent for agent in SPECIALIST_AGENTS},
    )

    # Each specialist can either hand off to another specialist (inter-agent
    # communication) or finalize the turn
    for agent in SPECIALIST_AGENTS:
        graph.add_conditional_edges(
            agent,
            route_handoff,
            {**{a: a for a in SPECIALIST_AGENTS}, "end": "finalize"},
        )

    graph.add_edge("finalize", END)

    return graph.compile(checkpointer=checkpointer)


# In-memory checkpointer: gives the graph cross-turn memory keyed by
# thread_id (we use the user/session id). For production with multiple
# backend instances, swap MemorySaver for a persistent checkpointer
# (e.g. a Postgres-backed one) so memory survives restarts and is shared
# across instances.
_checkpointer = MemorySaver()

# Compiled graph, ready to invoke. Pass config={"configurable": {"thread_id": user_id}}
# on each .invoke() call to maintain per-user conversation memory across turns.
kommunie_graph = build_graph(checkpointer=_checkpointer)
