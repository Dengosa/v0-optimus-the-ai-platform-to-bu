from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.supabase_client import get_supabase

router = APIRouter()

class OnboardingBookingRequest(BaseModel):
    reference: str
    email: Optional[str] = None
    slot_label: str
    slot_time: str

class OnboardingBookingResponse(BaseModel):
    status: str
    message: str

@router.post("/onboarding/book", response_model=OnboardingBookingResponse)
def book_onboarding(payload: OnboardingBookingRequest):
    if not payload.reference:
        raise HTTPException(status_code=400, detail="Reference is required")

    supabase = get_supabase()

    try:
        supabase.table("onboarding_bookings").insert({
            "reference": payload.reference,
            "email": payload.email,
            "slot_label": payload.slot_label,
            "slot_time": payload.slot_time,
            "status": "booked",
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to book slot: {e}")

    return OnboardingBookingResponse(
        status="booked",
        message=f"Your onboarding call is booked for {payload.slot_label} at {payload.slot_time}. We will contact you to confirm."
    )