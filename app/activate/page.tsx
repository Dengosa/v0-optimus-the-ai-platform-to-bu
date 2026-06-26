"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  MessageSquare,
  QrCode,
  Shield,
  Vault,
} from "lucide-react";

import { getActivationStatus, requestActivation } from "@/lib/api";

import ActivateBox from "./ActivateBox";

// NOTE: this page expects an `activated` flag for the legacy CTA.
// The previous build failed because `activated` was not defined.
const activated = false;

const included = [
  { icon: Shield, label: "Legal Agent" },
  { icon: Vault, label: "Opportunity Agent" },
  { icon: MessageCircle, label: "Health Agent" },
  { icon: Shield, label: "Credit Agent" },
  { icon: Vault, label: "Journey" },
  { icon: Vault, label: "Vault" },
  { icon: Mail, label: "Email Support" },
  { icon: MessageCircle, label: "WhatsApp Support" },
  { icon: MessageSquare, label: "SMS Support" },
  { icon: Shield, label: "One Support Pass" },
];

type ActivationPayload = {
  reference?: string;
  qr_code_url?: string;
  instructions?: string;
};

export default function ActivatePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activationRef, setActivationRef] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<"form" | "pending" | "confirmed">("form");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => {
    return () => clearPoll();
  }, []);

  const priceCard = useMemo(
    () => (
      <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Kommune Access</div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-5xl font-display">R300</div>
              <div className="text-muted-foreground">Once-off</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 bg-foreground/5 border border-foreground/10">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-mono text-xs text-muted-foreground">Technology Made For Real People</span>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {included.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex w-5 h-5 items-center justify-center rounded bg-foreground/5 text-foreground">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div className="text-sm text-foreground/90">
                  <div className="font-medium">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Button
            asChild
            disabled={isProcessing}
            className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full px-6 group h-14"
          >
            <Link
              href="#get-access"
              onClick={(e) => {
                // keep legacy CTA styling but do not trigger activation here
              }}
            >
              {activated ? "Activating..." : "Activate Access"}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            No popups. No payment windows. This demo flow shows exactly what happens next.
          </p>
        </div>
      </div>
    ),
    [activated, isProcessing]
  );

  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-10">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Activate Kommune</div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display tracking-tight">Activate Kommune</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
            Start building your legal, educational and financial future today.
          </p>
        </div>

        {priceCard}

        <ActivateBox
          isProcessing={isProcessing}
          step={step}
          error={error}
          activationRef={activationRef}
          qrCodeUrl={qrCodeUrl}
          instructions={instructions}
          status={status}
          email={email}
          whatsappNumber={whatsappNumber}
          setEmail={setEmail}
          setWhatsappNumber={setWhatsappNumber}
          onSubmit={async () => {
            setError(null);
            setIsProcessing(true);
            try {
              const resp = await requestActivation({
                email: email.trim() ? email.trim() : undefined,
                whatsapp_number: whatsappNumber.trim() ? whatsappNumber.trim() : undefined,
              });

              const ref = resp?.reference ?? null;
              setActivationRef(ref);
              setQrCodeUrl(resp?.qr_code_url ?? null);
              setInstructions(resp?.instructions ?? null);
              setStatus("pending");
              setStep("pending");

              clearPoll();
              pollTimer.current = setInterval(async () => {
                if (!ref) return;
                try {
                  const st = await getActivationStatus(ref);
                  const s = st?.status ?? null;
                  setStatus(s);
                  if (s === "confirmed") {
                    clearPoll();
                    setStep("confirmed");
                    setIsProcessing(false);
                  }
                } catch {
                  // keep polling
                }
              }, 10_000);
            } catch (e: any) {
              setError(e?.message ?? "Failed to activate. Please try again.");
              setIsProcessing(false);
            }
          }}
          onReset={() => {
            clearPoll();
            setStep("form");
            setActivationRef(null);
            setQrCodeUrl(null);
            setInstructions(null);
            setStatus(null);
            setError(null);
            setIsProcessing(false);
          }}
        />

      </div>
    </main>
  );
}

