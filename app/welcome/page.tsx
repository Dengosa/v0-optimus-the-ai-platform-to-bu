"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Mail, MessageCircle, PhoneCall } from "lucide-react";

type StepKey = "payment" | "schedule" | "confirmed";

type Slot = { label: string; time: string };

const slots: Slot[] = [
  { label: "Morning", time: "09:00" },
  { label: "Morning", time: "10:30" },
  { label: "Afternoon", time: "13:00" },
  { label: "Afternoon", time: "15:30" },
  { label: "Evening", time: "17:00" },
  { label: "Evening", time: "18:30" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WelcomePage() {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [step, setStep] = useState<StepKey>("payment");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reference = typeof window !== "undefined" ? localStorage.getItem("kommune_reference") : null;

  const handleBooking = async () => {
    if (!activeSlot) return;
    setIsBooking(true);
    setError(null);
    const parts = activeSlot.split("-");
    const label = parts[0];
    const time = parts[1];
    try {
      const res = await fetch(`${API_URL}/onboarding/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference || "UNKNOWN",
          slot_label: label,
          slot_time: time,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingMessage(data.message);
        setConfirmed(true);
        setStep("confirmed");
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-8">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Welcome To Kommune</div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display tracking-tight">Your Journey Begins Here</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
            Complete your payment and schedule your onboarding call. Your agents activate within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background">
                <CalendarDays className="w-5 h-5" />
              </span>
              <div>
                <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">What happens next?</div>
                <div className="text-2xl font-display">Two steps to activation.</div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Step 1 - Payment */}
              <div className={`rounded-xl border border-foreground/10 p-4 ${step === "payment" ? "bg-secondary/40" : "bg-background"}`}>
                <StepHeader icon={MessageCircle} title="Complete Your R300 Payment" />
                <div className="mt-3 text-sm text-muted-foreground">
                  Pay R300 via EFT to activate your account.
                </div>
                {step === "payment" && (
                  <div className="mt-4 space-y-2">
                    <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-3 text-sm">
                      <div className="font-medium">Bank: FNB</div>
                      <div>Account Name: Tina Ngoy</div>
                      <div>Account Number: 6306 7960 048</div>
                      <div>Branch Code: 250655</div>
                      {reference && <div className="mt-2 font-mono text-xs">Reference: {reference}</div>}
                    </div>
                    <Button
                      onClick={() => setStep("schedule")}
                      className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full mt-2"
                    >
                      I Have Paid — Schedule My Call
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2 - Schedule */}
              <div className={`rounded-xl border border-foreground/10 p-4 ${step === "schedule" ? "bg-secondary/40" : "bg-background"}`}>
                <StepHeader icon={PhoneCall} title="Schedule Onboarding Call" />
                {step === "payment" && (
                  <div className="mt-3 text-sm text-muted-foreground">Complete payment first.</div>
                )}
                {step === "schedule" && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Choose an available slot</div>
                    <div className="mt-3 grid sm:grid-cols-3 gap-2">