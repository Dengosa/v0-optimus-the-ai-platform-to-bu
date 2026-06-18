from __future__ import annotations

import base64
import datetime
import uuid
from typing import Any, Optional

from db.supabase_client import get_supabase

from app.core.vault.ledger import write_entry


ALLOWED_DOC_TYPES = {
    "section22",
    "section24",
    "passport",
    "proof_of_address",
    "other",
}


def upload_document(
    *,
    session_id: str,
    user_id: str,
    doc_type: str,
    filename: str,
    content_bytes: bytes,
    mime_type: str,
    expiry_date: Optional[datetime.date] = None,
    issued_date: Optional[datetime.date] = None,
    permit_number: Optional[str] = None,
) -> dict[str, Any]:
    """Fails-open style: never raise into main request flow."""

    try:
        if doc_type not in ALLOWED_DOC_TYPES:
            return {"status": "error", "error": f"Invalid doc_type: {doc_type}"}

        supabase = get_supabase()

        doc_uuid = str(uuid.uuid4())
        storage_path = f"{user_id}/{doc_uuid}_{filename}"

        # Upload to Supabase Storage (bucket name is part of the repo convention)
        try:
            supabase.storage.from_("vault-documents").upload(
                storage_path,
                content_bytes,
                {"content-type": mime_type},
            )
        except Exception as e:
            return {"status": "error", "error": str(e)}

        # Insert metadata row
        try:
            payload = {
                "id": doc_uuid,
                "session_id": session_id,
                "user_id": user_id,
                "doc_type": doc_type,
                "filename": filename,
                "storage_path": storage_path,
                "mime_type": mime_type,
                "size_bytes": len(content_bytes),
                "expiry_date": expiry_date.isoformat() if expiry_date else None,
                "issued_date": issued_date.isoformat() if issued_date else None,
                "permit_number": permit_number,
                "status": "active",
            }

            supabase.table("vault_documents").insert(payload).execute()
        except Exception as e:
            return {"status": "error", "error": str(e)}

        # Ledger write
        try:
            write_entry(
                actor="system",
                action="DOCUMENT_UPLOAD",
                resource="document",
                metadata={
                    "vault_document_id": doc_uuid,
                    "doc_type": doc_type,
                    "filename": filename,
                    "expiry_date": expiry_date.isoformat() if expiry_date else None,
                },
            )
        except Exception:
            # Fails-open: ledger write errors should not fail upload
            pass

        return {"status": "ok", "vault_document_id": doc_uuid, "expiry_date": expiry_date.isoformat() if expiry_date else None}

    except Exception as e:
        return {"status": "error", "error": str(e)}


def get_document_base64(vault_document_id: str) -> dict[str, Any] | None:
    try:
        supabase = get_supabase()

        try:
            res = (
                supabase.table("vault_documents")
                .select("filename,mime_type,storage_path")
                .eq("id", vault_document_id)
                .eq("status", "active")
                .maybe_single()
                .execute()
            )
        except Exception:
            return None

        row = getattr(res, "data", None) if hasattr(res, "data") else None
        if not row:
            # supabase-py v2 sometimes returns res.data directly
            if isinstance(res, dict) and res.get("data"):
                row = res["data"]
            else:
                row = None
        if not row:
            return None

        storage_path = row.get("storage_path")
        filename = row.get("filename")
        mime_type = row.get("mime_type")

        if not storage_path or not filename:
            return None

        try:
            downloaded = supabase.storage.from_("vault-documents").download(storage_path)
            # downloaded is bytes for storage.download
            content_b = downloaded if isinstance(downloaded, (bytes, bytearray)) else bytes(downloaded)
        except Exception:
            return None

        return {
            "filename": filename,
            "content": base64.b64encode(content_b).decode(),
            "mime_type": mime_type,
        }

    except Exception:
        return None


def list_documents(session_id: str) -> list[dict[str, Any]]:
    try:
        supabase = get_supabase()

        try:
            res = (
                supabase.table("vault_documents")
                .select(
                    "id,doc_type,filename,expiry_date,issued_date,permit_number,uploaded_at"
                )
                .eq("session_id", session_id)
                .eq("status", "active")
                .order("uploaded_at", desc=True)
                .execute()
            )
        except Exception:
            return []

        rows = getattr(res, "data", None)
        if not rows:
            return []

        out: list[dict[str, Any]] = []
        for r in rows:
            out.append(
                {
                    "vault_document_id": r.get("id"),
                    "doc_type": r.get("doc_type"),
                    "filename": r.get("filename"),
                    "expiry_date": r.get("expiry_date"),
                    "issued_date": r.get("issued_date"),
                    "permit_number": r.get("permit_number"),
                    "uploaded_at": r.get("uploaded_at"),
                }
            )
        return out

    except Exception:
        return []


def check_expiring_documents(
    session_id: str, within_days: int = 30
) -> list[dict[str, Any]]:
    try:
        today = datetime.date.today()
        cutoff = today + datetime.timedelta(days=within_days)

        docs = list_documents(session_id)

        expiring: list[tuple[datetime.date, dict[str, Any]]] = []
        for d in docs:
            expiry = d.get("expiry_date")
            if not expiry:
                continue
            try:
                expiry_date = (
                    expiry
                    if isinstance(expiry, datetime.date)
                    else datetime.date.fromisoformat(str(expiry))
                )
            except Exception:
                continue

            if expiry_date <= cutoff:
                expiring.append((expiry_date, d))

        expiring.sort(key=lambda x: x[0])
        return [d for _, d in expiring]

    except Exception:
        return []

