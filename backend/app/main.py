from __future__ import annotations

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.security.cors import build_cors_settings


def create_app() -> FastAPI:
    """Kommune backend app entrypoint.

    Notes:
    - This repository currently contains a Next.js frontend + mock API routes.
      This FastAPI backend is added as the production foundation.
    - All configuration is env-driven to avoid unsafe defaults.
    """

    app = FastAPI(title="Kommune", version=os.getenv("KOMMUNE_VERSION", "0.1.0"))

    # Health check (useful for k8s / uptime monitors)
    @app.get("/health")
    async def health() -> dict:
        return {"ok": True, "service": "kommune-backend"}

    # Optional: execute the (skeleton) agent graph.
    # This endpoint is primarily for integration testing while we flesh out
    # LangGraph + Vault + strict Pydantic IO models.
    @app.post("/agents/run")
    async def agents_run(payload: dict) -> dict:
        # NOTE: We keep validation minimal for now; the next step will
        # introduce Pydantic v2 schemas and DI for auth + Vault.
        from app.core.agent_graph import run_agent_graph
        from app.core.state import new_state

        session_id = str(payload.get("session_id") or "demo-session")
        user_id = str(payload.get("user_id") or "demo-user")
        state = new_state(session_id=session_id, user_id=user_id)
        # Merge any caller-provided routing/emergency flags.
        # (LangGraph reducers will become the authoritative merge logic later.)
        for k, v in payload.items():
            state[k] = v

        res = await run_agent_graph(state)  # type: ignore[arg-type]
        return {"ok": True, "status": res.status, "payload": res.payload}


    # Gatekeeper: Stripe webhook placeholder.
    # Implementation details will be added once we decide on the exact
    # Stripe product model (subscriptions vs one-time activation).
    @app.post("/stripe/webhook")
    async def stripe_webhook_placeholder() -> dict:
        # TODO: validate signature using STRIPE_WEBHOOK_SECRET
        # - read raw body
        # - verify Stripe signature
        # - route event to domain service (Gatekeeper)
        return {"received": True, "placeholder": True}

    cors_settings = build_cors_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_settings["allow_origins"],
        allow_credentials=cors_settings["allow_credentials"],
        allow_methods=cors_settings["allow_methods"],
        allow_headers=cors_settings["allow_headers"],
    )

    return app


app = create_app()

