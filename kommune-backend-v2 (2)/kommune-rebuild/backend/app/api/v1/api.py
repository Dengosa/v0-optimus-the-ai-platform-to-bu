from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import chat, waitlist, activation, vault

api_router = APIRouter()

api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(waitlist.router, tags=["waitlist"])
api_router.include_router(activation.router, tags=["activation"])
api_router.include_router(vault.router, tags=["vault"])
