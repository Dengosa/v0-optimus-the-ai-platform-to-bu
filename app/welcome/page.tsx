"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, PhoneCall, Mail } from "lucide-react";

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
          reference: "UNKNOWN",
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
                <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Next steps</div>
                <div className="text-2xl font-display">Two steps to activation.</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-foreground/10 p-4 bg-secondary/40">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/10 text-foreground">
                    <Mail className="w-5 h-5" />
                  </span>
                  <div className="text-sm font-medium">Step 1 — Complete Your R300 Payment</div>
                </div>
                <div className="mt-4 rounded-xl border border-foreground/10 bg-background p-3 text-sm space-y-1">
                  <div className="font-medium">Bank: FNB</div>
                  <div>Account Name: Tina Ngoy</div>
                  <div>Account Number: 63067960048</div>
                  <div>Branch Code: 250655</div>
                </div>
                <Button
                  onClick={() => setStep("schedule")}
                  className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full mt-4"
                >
                  I Have Paid — Schedule My Call
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="rounded-xl border border-foreground/10 p-4 bg-background">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/10 text-foreground">
                    <PhoneCall className="w-5 h-5" />
                  </span>
                  <div className="text-sm font-medium">Step 2 — Schedule Onboarding Call</div>
                </div>

                {step === "payment" && (
                  <div className="mt-3 text-sm text-muted-foreground">Complete payment first to unlock scheduling.</div>
                )}

                {step === "schedule" && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-3">Choose an available slot</div>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((s) => {
                        const key = `${s.label}-${s.time}`;
                        const isSel = activeSlot === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveSlot(key)}
                            className={`text-left rounded-xl border px-3 py-2 transition-all ${isSel ? "border-foreground bg-foreground/5" : "border-foreground/10 hover:border-foreground/20"}`}
                          >
                            <div className="font-medium text-foreground/90 text-sm">{s.label}</div>
                            <div className="font-mono text-xs text-muted-foreground mt-0.5">{s.time}</div>
                          </button>
                        );
                      })}
                    </div>
                    {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
                    <Button
                      disabled={!activeSlot || isBooking}
                      onClick={() => window.open("https://calendly.com/inclusivebambu/30min", "_blank")}
                      className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full mt-4"
                    >
                      {isBooking ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </div>
                )}

                {step === "confirmed" && (
                  <div className="mt-3 text-sm text-green-600">{bookingMessage}</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button asChild className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full">
                <Link href="/activate#get-access">
                  Back to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-4">What unlocks after activation</div>
            <div className="space-y-3">
              {[
                "Legal guidance — visas, permits, your rights",
                "Credit building — banking without SA ID",
                "Health access — clinics, ARVs, your rights",
                "Education — qualifications recognition, NSFAS",
                "Emergency support — detention, violence, deportation",
                "Personal vault — your documents, stored securely",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-foreground/5 inline-flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-foreground" />
                  </span>
                  <div className="text-sm font-medium">{item}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-foreground/10 bg-secondary/30 p-4">
              <div className="text-sm font-medium">Your AI assistants are preparing.</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Once payment is confirmed, your agents activate and your journey begins within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
