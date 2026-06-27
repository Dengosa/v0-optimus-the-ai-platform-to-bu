import os
import secrets
import string
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr

from db.supabase_client import get_supabase
from notifications.resend_client import send_activation_request_email, send_activation_confirmed_email

router = APIRouter()

ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "")
ZAPPER_QR_URL = os.environ.get("ZAPPER_QR_URL", "https://placehold.co/300x300?text=Zapper+QR")
ZAPPER_AMOUNT_ZAR = 300


def _generate_reference() -> str:
    alphabet = string.ascii_uppercase + string.digits
    code = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"KOM-{code}"


class ActivationRequest(BaseModel):
    email: Optional[EmailStr] = None
    whatsapp_number: Optional[str] = None


class ActivationRequestResponse(BaseModel):
    reference: str
    amount_zar: int
    qr_code_url: str
    instructions: str


@router.post("/activate/request", response_model=ActivationRequestResponse)
def request_activation(payload: ActivationRequest):
    if not payload.email and not payload.whatsapp_number:
        raise HTTPException(status_code=400, detail="Provide at least an email or WhatsApp number")

    supabase = get_supabase()
    reference = _generate_reference()

    try:
        supabase.table("pending_activations").insert({
            "email": payload.email,
            "whatsapp_number": payload.whatsapp_number,
            "reference": reference,
            "status": "pending",
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log request: {e}")

    if payload.email:
        try:
            send_activation_request_email(
                to_email=payload.email,
                reference=reference,
                amount_zar=ZAPPER_AMOUNT_ZAR,
                zapper_qr_url=ZAPPER_QR_URL,
            )
        except Exception:
            pass

    return ActivationRequestResponse(
        reference=reference,
        amount_zar=ZAPPER_AMOUNT_ZAR,
        qr_code_url=ZAPPER_QR_URL,
        instructions=(
            f"Scan the QR code and pay R{ZAPPER_AMOUNT_ZAR}. "
            f"Your reference is {reference} — please keep it. "
            "We'll activate your account within 24 hours of payment."
        ),
    )


class AdminActivateRequest(BaseModel):
    reference: Optional[str] = None
    email: Optional[EmailStr] = None


class AdminActivateResponse(BaseModel):
    status: str
    email: Optional[str] = None
    reference: Optional[str] = None


@router.post("/admin/activate-user", response_model=AdminActivateResponse)
def admin_activate_user(
    payload: AdminActivateRequest,
    x_admin_secret: str = Header(default=""),
):
    if not ADMIN_SECRET or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not payload.reference and not payload.email:
        raise HTTPException(status_code=400, detail="Provide a reference or email to activate")

    supabase = get_supabase()

    query = supabase.table("pending_activations").select("*")
    if payload.reference:
        query = query.eq("reference", payload.reference)
    else:
        query = query.eq("email", payload.email)

    result = query.execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No matching activation request found")

    record = result.data[0]
    email = record.get("email")
    reference = record.get("reference")

    supabase.table("pending_activations").update(
        {"status": "confirmed", "confirmed_at": "now()"}
    ).eq("reference", reference).execute()

    if email:
        try:
            existing = supabase.table("users").select("id").eq("email", email).execute()
            if existing.data:
                supabase.table("users").update(
                    {"activated_at": "now()", "payment_reference": reference}
                ).eq("email", email).execute()
            else:
                supabase.table("users").insert({
                    "email": email,
                    "activated_at": "now()",
                    "payment_reference": reference,
                }).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to activate user: {e}")

        try:
            send_activation_confirmed_email(email, name=None)
        except Exception:
            pass

    return AdminActivateResponse(status="activated", email=email, reference=reference)


class ActivationStatusResponse(BaseModel):
    status: str


@router.get("/activate/status/{reference}", response_model=ActivationStatusResponse)
def activation_status(reference: str):
    supabase = get_supabase()
    result = (
        supabase.table("pending_activations")
        .select("status")
        .eq("reference", reference)
        .execute()
    )
    if not result.data:
        return ActivationStatusResponse(status="not_found")
    return ActivationStatusResponse(status=result.data[0]["status"])




class SpotMeRequest(BaseModel):
    reference: str
    friend_contact: str


class SpotMeResponse(BaseModel):
    status: str
    message: str


@router.post("/activate/spotme", response_model=SpotMeResponse)
def spotme(payload: SpotMeRequest):
    if not payload.reference or not payload.friend_contact:
        raise HTTPException(status_code=400, detail="Reference and friend contact are required")

    supabase = get_supabase()

    result = supabase.table("pending_activations").select("*").eq("reference", payload.reference).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Activation reference not found")

    record = result.data[0]

    if record.get("spotme_used"):
        raise HTTPException(status_code=409, detail="SpotMe has already been used for this reference")

    friend_reference = _generate_reference()

    supabase.table("pending_activations").insert({
        "reference": friend_reference,
        "email": payload.friend_contact if "@" in payload.friend_contact else None,
        "whatsapp_number": payload.friend_contact if "@" not in payload.friend_contact else None,
        "status": "pending",
        "spotted_by": payload.reference,
    }).execute()

    supabase.table("pending_activations").update(
        {"spotme_used": True}
    ).eq("reference", payload.reference).execute()

    return SpotMeResponse(
        status="spotted",
        message=f"Your friend has been spotted! We will activate them alongside you once payment is confirmed."
    )