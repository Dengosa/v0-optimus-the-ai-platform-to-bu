from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Kommune API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are Lex, Kommune's Legal Agent — an AI system that helps 
migrants, refugees, and asylum seekers in South Africa know their rights and take action.

You are not a chatbot. You are an execution system.

Every response must:
1. Directly address the user's situation
2. Cite real South African law where relevant
3. Give concrete next steps — not general advice
4. Identify if this is an emergency situation
5. Preserve the user's dignity

Key legal facts:
- Section 22(4) Refugees Act 130 of 1998: permits deemed extended while renewal pending
- Police cannot enter homes without a warrant
- Detention maximum: 48 hours before court appearance  
- Children cannot be detained
- Non-refoulement: asylum seekers cannot be deported
- LHR emergency: 011 339 1960
- UNHCR SA: 012 354 8300
- Scalabrini: 021 465 6433
- SAPS: 10111

Emergency keywords: police, arrested, detained, deport, violence, scared, raid, door

When you detect an emergency, start your response with [EMERGENCY] and include hotline numbers.

Respond in plain conversational text. Be direct, warm, and action-oriented.
Always end with a clear next step the user can take right now."""


# ---------------- HEALTH ----------------
@app.get("/health")
def health():
    return {"status": "ok", "agent": "Lex", "model": "gemini"}


# ---------------- WAITLIST ----------------
@app.post("/api/v1/waitlist")
def join_waitlist(payload: dict):
    print(f"Waitlist signup: {payload.get('email')}")
    return {"status": "ok", "message": "You're on the list."}


@app.get("/api/v1/waitlist/count")
def waitlist_count():
    return {"count": 247}


# ---------------- ACTIVATION ----------------
@app.post("/api/v1/activate/request")
def activate_request(payload: dict):
    email = payload.get("email", "unknown")
    print(f"Activation request: {email}")
    return {
        "reference": f"KMN-{abs(hash(email)) % 100000:05d}",
        "status": "pending",
        "message": "Send R300 via Zapper to activate your agents."
    }


@app.get("/api/v1/activate/status/{reference}")
def activate_status(reference: str):
    return {"reference": reference, "status": "active"}


# ---------------- CHAT STREAM ----------------
@app.post("/api/v1/chat/stream")
def chat_stream(payload: dict):
    message = payload.get("message", "")
    history = payload.get("history", [])

    def event_stream():
        try:
            # Detect emergency keywords
            emergency_words = ["police", "arrested", "detained", "deport",
                               "violence", "scared", "raid", "door", "knocking",
                               "remove", "illegal", "danger"]
            is_emergency = any(w in message.lower() for w in emergency_words)

            # Determine which agents are involved
            agents = ["Lex"]
            if any(w in message.lower() for w in ["credit", "bank", "money", "loan", "bureau"]):
                agents.append("Rex")
            if any(w in message.lower() for w in ["health", "clinic", "hospital", "medical", "doctor"]):
                agents.append("Vita")
            if any(w in message.lower() for w in ["study", "university", "bursary", "job", "work", "school"]):
                agents.append("Opportunity")

            # Send routing event
            routing = {
                "agents_involved": agents,
                "priority_flagged": is_emergency,
                "escalate_ngo": is_emergency,
                "preview_mode": False
            }
            yield f"event: routing\ndata: {json.dumps(routing)}\n\n"

            # Send emergency event if needed
            if is_emergency:
                emergency = {
                    "active": True,
                    "ngo_name": "Lawyers for Human Rights",
                    "rights": [
                        "Police cannot enter your home without a warrant",
                        "You can only be detained for 48 hours maximum",
                        "You have the right to remain silent",
                        "You have the right to legal representation",
                        "Asylum seekers cannot be deported — non-refoulement applies",
                        "Children cannot be detained under any circumstances"
                    ]
                }
                yield f"event: emergency\ndata: {json.dumps(emergency)}\n\n"

            # Build conversation history for Gemini
            gemini_history = []
            for msg in history[:-1]:
                role = "user" if msg.get("role") == "user" else "model"
                gemini_history.append({
                    "role": role,
                    "parts": [msg.get("content", "")]
                })

            # Call Gemini with streaming
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SYSTEM_PROMPT
            )

            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(message, stream=True)

            # Stream response word by word
            for chunk in response:
                if chunk.text:
                    data = json.dumps({"delta": chunk.text})
                    yield f"event: message\ndata: {data}\n\n"

            # Send done event
            yield f"event: done\ndata: {{}}\n\n"

        except Exception as e:
            error_msg = f"I encountered an issue: {str(e)}. Please try again."
            data = json.dumps({"delta": error_msg})
            yield f"event: message\ndata: {data}\n\n"
            yield f"event: done\ndata: {{}}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )