"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Mail, MessageCircle, Sms } from "lucide-react";

type StepKey = "whatsapp" | "email" | "call";

type Slot = { label: string; time: string };

const slots: Slot[] = [
  { label: "Morning", time: "09:00" },
  { label: "Morning", time: "10:30" },
  { label: "Afternoon", time: "13:00" },
  { label: "Afternoon", time: "15:30" },
  { label: "Evening", time: "17:00" },
  { label: "Evening", time: "18:30" },
];

export default function WelcomePage() {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [step, setStep] = useState<StepKey>("whatsapp");
  const [confirmed, setConfirmed] = useState(false);

  const selectedSlot = useMemo(() => {
    if (!activeSlot) return null;
    const s = slots.find((x) => `${x.label}-${x.time}` === activeSlot);
    return s || null;
  }, [activeSlot]);

  const status = (key: StepKey) => {
    if (key === step) return "Pending Delivery";
    const order: StepKey[] = ["whatsapp", "email", "call"];
    const idxStep = order.indexOf(step);
    const idxKey = order.indexOf(key);
    if (idxKey < idxStep) return "Sent";
    if (idxKey > idxStep) return "Not Started";
    return "Pending";
  };

  const goNext = () => {
    setConfirmed(false);
    if (step === "whatsapp") setStep("email");
    else if (step === "email") setStep("call");
    else setStep("call");
  };

  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-8">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Welcome To Kommune</div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display tracking-tight">Welcome To Kommune</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
            Technology Made For Real People. Your Journey is being prepared.
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
                <div className="text-2xl font-display">Your next move starts now.</div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="space-y-3">
              <StepRow
                icon={MessageCircle}
                title="WhatsApp Message Sent"
                status={step === "whatsapp" ? status("whatsapp") : step === "email" || step === "call" ? "Sent" : status("whatsapp")}
                isActive={step === "whatsapp"}
              />
              <StepRow
                icon={Mail}
                title="Welcome Email Sent"
                status={step === "email" ? status("email") : step === "call" ? "Sent" : "Pending"}
                isActive={step === "email"}
              />
              <div className={`rounded-xl border border-foreground/10 p-4 ${step === "call" ? "bg-secondary/40" : "bg-background"}`}>
                <StepHeader icon={Sms} title="Schedule Onboarding Call" />

                {step !== "call" ? (
                  <div className="mt-3 text-sm text-muted-foreground">Select a time after WhatsApp and email are sent.</div>
                ) : (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Choose an available slot</div>
                    <div className="mt-3 grid sm:grid-cols-3 gap-2">
                      {slots.map((s) => {
                        const key = `${s.label}-${s.time}`;
                        const isSel = activeSlot === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveSlot(key)}
                            className={`text-left rounded-xl border px-3 py-2 transition-all ${
                              isSel
                                ? "border-foreground bg-foreground/5"
                                : "border-foreground/10 hover:border-foreground/20"
                            }`}
                          >
                            <div className="font-medium text-foreground/90 text-sm">{s.label}</div>
                            <div className="font-mono text-xs text-muted-foreground mt-0.5">{s.time}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Status: <span className="text-foreground">{confirmed ? "Booked" : "Ready"}</span>
                      </div>
                      <Button
                        disabled={!activeSlot}
                        onClick={() => {
                          setConfirmed(true);
                        }}
                        className="bg-foreground hover:bg-foreground/90 text-background rounded-full"
                      >
                        Confirm booking
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={goNext}
                className="rounded-full"
                disabled={step === "call"}
              >
                Continue
              </Button>
              <Button
                asChild
                disabled={!confirmed && step === "call"}
                className="bg-foreground hover:bg-foreground/90 text-background rounded-full"
              >
                <Link href="/journey">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-4">Agent initialization</div>

            <div className="space-y-4">
              <AgentInitRow label="Legal Agent" state={step === "call" || step === "email" ? "Initializing" : "Initializing"} />
              <AgentInitRow label="Opportunity Agent" state={step === "call" || step === "email" ? "Initializing" : "Initializing"} />
              <AgentInitRow label="Health Agent" state={step === "call" ? "Initializing" : "Initializing"} />
              <AgentInitRow label="Credit Agent" state={step === "call" ? "Initializing" : "Initializing"} />
              <AgentInitRow label="Journey" state={"Creating"} />
              <AgentInitRow label="Vault" state={"Ready"} strong />
            </div>

            <div className="mt-6 rounded-xl border border-foreground/10 bg-secondary/30 p-4">
              <div className="text-sm font-medium">Your AI agents are preparing.</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Built for progress: you will receive WhatsApp onboarding, a welcome email, and journey setup instructions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StepHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/10 text-foreground">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <div className="text-sm font-medium">{title}</div>
      </div>
    </div>
  );
}

function StepRow({
  icon: Icon,
  title,
  status,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status: string;
  isActive: boolean;
}) {
  return (
    <div className={`rounded-xl border border-foreground/10 p-4 ${isActive ? "bg-secondary/40" : "bg-background"}`}>
      <StepHeader icon={Icon} title={title} />
      <div className="mt-3 text-sm text-muted-foreground">
        Status: <span className="text-foreground">{status}</span>
      </div>
    </div>
  );
}

function AgentInitRow({
  label,
  state,
  strong,
}: {
  label: string;
  state: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`text-sm font-medium ${strong ? "text-foreground" : "text-foreground/90"}`}>{label}</div>
      <div className={`font-mono text-xs ${strong ? "text-green-600" : "text-muted-foreground"}`}>{state}</div>
    </div>
  );
}

