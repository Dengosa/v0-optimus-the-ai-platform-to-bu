from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints.vault import router as vault_router

api_router = APIRouter()

api_router.include_router(vault_router, tags=["vault"], prefix="")

