import json
import time
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr

from agents.graph import kommunie_graph
from db.supabase_client import get_supabase
from notifications.resend_client import send_waitlist_confirmation

import os

app = FastAPI(title="Kommunie API")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Waitlist
# ---------------------------------------------------------------------------
class WaitlistRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    city: Optional[str] = None
    source: Optional[str] = None


@app.post("/waitlist")
def join_waitlist(payload: WaitlistRequest):
    supabase = get_supabase()

    try:
        result = (
            supabase.table("waitlist")
            .insert(
                {
                    "email": payload.email,
                    "name": payload.name,
                    "city": payload.city,
                    "source": payload.source,
                }
            )
            .execute()
        )
    except Exception as e:
        # Handle duplicate email gracefully
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=409, detail="Email already on waitlist")
        raise HTTPException(status_code=500, detail=f"Failed to join waitlist: {e}")

    try:
        send_waitlist_confirmation(payload.email, payload.name)
    except Exception:
        # Don't fail the request if email sending fails
        pass

    return {"status": "ok", "data": result.data}


# In-memory cache for waitlist count (60s TTL)
_count_cache = {"value": 0, "ts": 0.0}
COUNT_CACHE_TTL = 60


@app.get("/waitlist/count")
def waitlist_count():
    now = time.time()
    if now - _count_cache["ts"] < COUNT_CACHE_TTL:
        return {"count": _count_cache["value"]}

    supabase = get_supabase()
    try:
        result = (
            supabase.table("waitlist")
            .select("id", count="exact")
            .execute()
        )
        count = result.count or 0
    except Exception:
        count = _count_cache["value"]  # fall back to stale cache on error

    _count_cache["value"] = count
    _count_cache["ts"] = now
    return {"count": count}


# ---------------------------------------------------------------------------
# Chat (streaming)
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    user_id: Optional[str] = None
    session_id: Optional[str] = None


@app.post("/chat/stream")
async def chat_stream(payload: ChatRequest):
    """
    SSE streaming endpoint. Runs the LangGraph (Nemo router -> specialist
    agent(s), with inter-agent handoffs), then streams the result back as
    SSE events.

    Conversation memory: the graph is checkpointed per `thread_id`
    (session_id, falling back to user_id, falling back to "anonymous").
    This lets agents recall earlier turns in the same session even if the
    frontend doesn't resend full history. `history` is still accepted and
    merged in for clients that manage their own history.

    Event sequence:
      event: routing   -> {"agent": "...", "escalate_ngo": bool, "ngo": "...", "agents_involved": [...]}
      event: message   -> {"delta": "<chunk of text>"}   (repeated)
      event: done      -> {}
    """

    history = [{"role": m.role, "content": m.content} for m in payload.history]
    thread_id = payload.session_id or payload.user_id or "anonymous"

    def event_stream():
        # Run the graph (LangGraph handles Nemo -> specialist routing,
        # inter-agent handoffs, and per-thread memory via checkpointer)
        result = kommunie_graph.invoke(
            {
                "messages": history,
                "user_message": payload.message,
                "user_id": payload.user_id,
            },
            config={"configurable": {"thread_id": thread_id}},
        )

        # First, send routing info so the frontend can show the agent badge(s)
        routing = {
            "agent": result.get("agent"),
            "escalate_ngo": result.get("escalate_ngo", False),
            "ngo": result.get("ngo"),
            "agents_involved": result.get("visited_agents", []),
        }
        yield f"event: routing\ndata: {json.dumps(routing)}\n\n"

        # Stream the response text in chunks
        response_text = result.get("response", "")
        chunk_size = 20
        for i in range(0, len(response_text), chunk_size):
            chunk = response_text[i : i + chunk_size]
            yield f"event: message\ndata: {json.dumps({'delta': chunk})}\n\n"

        yield f"event: done\ndata: {{}}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
