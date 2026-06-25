from __future__ import annotations
import os
import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import anthropic

router = APIRouter()

class HistoryMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: List[HistoryMessage] = []
    user_id: Optional[str] = None
    session_id: Optional[str] = None

SYSTEM_PROMPT = """You are Lex, Kommune's Legal Agent — an AI infrastructure 
system that helps migrants, refugees, and asylum seekers in South Africa know 
their rights and take action.

You are not a chatbot. You are an execution system.

Every response must:
1. Directly address the user's situation
2. Cite real South African law where relevant (Refugees Act 130 of 1998, 
   Immigration Act 13 of 2002, Constitution Section 27/34, etc.)
3. Give concrete next steps — not general advice
4. Identify if this is an emergency situation
5. Preserve the user's dignity — they are building a future, not a case number

Key legal facts you must know:
- Section 22(4) of the Refugees Act: permits deemed extended while renewal pending
- Sigauke case: confirmed deemed extension protection
- Police cannot enter homes without a warrant
- Detention maximum: 48 hours before court appearance
- Children cannot be detained
- Non-refoulement: asylum seekers cannot be deported
- LHR emergency: 011 339 1960
- UNHCR SA: 012 354 8300
- Scalabrini: 021 465 6433

Format your response as JSON:
{
  "message": "your full response to the user",
  "routing": {
    "agents_involved": ["Lex"],
    "priority_flagged": false,
    "escalate_ngo": false
  },
  "emergency": {
    "active": false,
    "ngo_name": null,
    "rights": []
  },
  "preview_mode": false
}

If this is an emergency (detention, deportation, violence, denied healthcare 
for a child), set emergency.active to true and populate rights and ngo_name.
"""

async def generate_stream(payload: ChatPayload):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    messages = []
    for h in payload.history[:-1]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": payload.message})

    full_response = ""
    
    try:
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                # Stream delta to frontend
                chunk = json.dumps({"delta": text})
                yield f"data: {chunk}\n\n"
                await asyncio.sleep(0)

        # Parse final response and send structured state
        try:
            parsed = json.loads(full_response)
            state = json.dumps({
                "routing": parsed.get("routing", {}),
                "emergency": parsed.get("emergency", {}),
                "preview_mode": parsed.get("preview_mode", False),
                "assistant_content": parsed.get("message", full_response),
            })
            yield f"data: {state}\n\n"
        except json.JSONDecodeError:
            # If not valid JSON just send the raw text as state
            state = json.dumps({
                "assistant_content": full_response,
                "routing": {"agents_involved": ["Lex"]},
                "emergency": {"active": False},
                "preview_mode": False,
            })
            yield f"data: {state}\n\n"

    except Exception as e:
        error = json.dumps({"error": str(e)})
        yield f"data: {error}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/chat/stream")
async def chat_stream(payload: ChatPayload):
    return StreamingResponse(
        generate_stream(payload),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/chat/health")
async def chat_health():
    return {"ok": True, "agent": "Lex"}