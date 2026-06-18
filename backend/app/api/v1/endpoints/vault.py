from __future__ import annotations

import datetime
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.vault.documents import (
    ALLOWED_DOC_TYPES,
    check_expiring_documents,
    list_documents,
    upload_document,
)

router = APIRouter()


@router.post("/vault/{session_id}/documents")
async def upload_vault_document(
    session_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    user_id: str = Form(...),
    expiry_date: Optional[str] = Form(None),
    issued_date: Optional[str] = Form(None),
    permit_number: Optional[str] = Form(None),
) -> dict[str, Any]:
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid doc_type: {doc_type}")

    try:
        expiry_date_dt = (
            datetime.date.fromisoformat(expiry_date) if expiry_date else None
        )
        issued_date_dt = (
            datetime.date.fromisoformat(issued_date) if issued_date else None
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid date format: {e}")

    # Enforce max size: 5MB
    max_bytes = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")

    result = upload_document(
        session_id=session_id,
        user_id=user_id,
        doc_type=doc_type,
        filename=file.filename or "document",
        content_bytes=content,
        mime_type=file.content_type or "application/octet-stream",
        expiry_date=expiry_date_dt,
        issued_date=issued_date_dt,
        permit_number=permit_number,
    )

    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error") or "upload failed")

    return result


@router.get("/vault/{session_id}/documents")
async def list_vault_documents(session_id: str) -> dict[str, Any]:
    return {"session_id": session_id, "documents": list_documents(session_id)}


@router.get("/vault/{session_id}/documents/expiring")
async def expiring_vault_documents(
    session_id: str,
    within_days: int = 30,
) -> dict[str, Any]:
    return {
        "session_id": session_id,
        "expiring": check_expiring_documents(session_id, within_days=within_days),
    }

