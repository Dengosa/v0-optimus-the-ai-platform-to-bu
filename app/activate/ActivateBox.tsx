"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Heart, Loader2, QrCode, RefreshCcw, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Props = {
  step: "form" | "pending" | "confirmed";
  error: string | null;
  activationRef: string | null;
  qrCodeUrl: string | null;
  instructions: string | null;
  status: string | null;
  email: string;
  whatsappNumber: string;
  setEmail: (v: string) => void;
  setWhatsappNumber: (v: string) => void;
  isProcessing: boolean;
  onSubmit: () => void | Promise<void>;
  onReset: () => void;
};

export default function ActivateBox(props: Props) {
  const [spotmeContact, setSpotmeContact] = useState("");
  const [spotmeSent, setSpotmeSent] = useState(false);
  const [spotmeError, setSpotmeError] = useState<string | null>(null);
  const [spotmeLoading, setSpotmeLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const hasEmail = props.email.trim().length > 3;
    const hasWhatsapp = props.whatsappNumber.trim().length > 3;
    return (hasEmail || hasWhatsapp) && !props.isProcessing;
  }, [props.email, props.whatsappNumber, props.isProcessing]);

  const handleSpotme = async () => {
    if (!spotmeContact.trim() || !props.activationRef) return;
    setSpotmeLoading(true);
    setSpotmeError(null);
    try {
      const res = await fetch(`${API_URL}/activate/spotme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: props.activationRef,
          friend_contact: spotmeContact.trim(),
        }),
      });
      if (res.ok) {
        setSpotmeSent(true);
      } else {
        const err = await res.json();
        setSpotmeError(err.detail || "Something went wrong. Please try again.");
      }
    } catch {
      setSpotmeError("Could not connect. Please try again.");
    } finally {
      setSpotmeLoading(false);
    }
  };

  return (
    <section id="get-access" className="mt-10 space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Kommune Access</div>
              <h2 className="mt-3 text-2xl font-display">Get Access</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email or WhatsApp. We will send your reference and payment details.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 bg-foreground/5 border border-foreground/10">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="font-mono text-xs text-muted-foreground">24/7 workflow</span>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); props.onSubmit(); }}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email (optional)</label>
              <input
                className="w-full rounded-xl border border-foreground/10 bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                value={props.email}
                onChange={(e) => props.setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                disabled={props.step !== "form" || props.isProcessing}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">WhatsApp number (optional)</label>
              <input
                className="w-full rounded-xl border border-foreground/10 bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                value={props.whatsappNumber}
                onChange={(e) => props.setWhatsappNumber(e.target.value)}
                type="tel"
                placeholder="+27 82 123 4567"
                disabled={props.step !== "form" || props.isProcessing}
              />
            </div>

            {props.error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {props.error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-foreground hover:bg-foreground/90 text-background px-6 group h-12"
              >
                {props.isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </span>
                ) : "Request Activation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-foreground/20 hover:bg-foreground/5"
                disabled={props.step === "form" || props.isProcessing}
                onClick={() => props.onReset()}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Your information is used only to create your activation reference.
            </p>
          </form>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/10">
              <QrCode className="w-5 h-5 text-foreground" />
            </span>
            <div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Status</div>
              <div className="text-lg font-medium">{props.step === "confirmed" ? "Activated" : "Waiting"}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reference</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="font-mono text-sm text-foreground break-all">{props.activationRef ?? "—"}</div>
                {props.step === "confirmed" && <Check className="w-4 h-4 text-green-500" />}
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                Status: {props.status ?? "—"}
              </div>
            </div>

            <div className="rounded-xl border border-foreground/10 bg-background p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Payment Instructions</div>
              <div className="mt-3 space-y-1 text-sm text-foreground">
                {props.activationRef ? (
                  <>
                    <div><span className="text-muted-foreground">Bank:</span> FNB</div>
                    <div><span className="text-muted-foreground">Account Name:</span> Tina Ngoy</div>
                    <div><span className="text-muted-foreground">Account Number:</span> 63067960048</div>
                    <div><span className="text-muted-foreground">Branch Code:</span> 250655</div>
                    <div><span className="text-muted-foreground">Amount:</span> R300</div>
                    <div><span className="text-muted-foreground">Reference:</span> <span className="font-mono font-bold">{props.activationRef}</span></div>
                    <p className="mt-2 text-xs text-muted-foreground">Use your reference number as the payment reference. We activate your account within 24 hours of payment confirmation.</p>
                  </>
                ) : (
                  <div className="text-muted-foreground">Submit the form to receive your payment details.</div>
                )}
              </div>
            </div>

            {props.step === "confirmed" && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm">
                <div className="font-medium text-green-600">Activated!</div>
                <div className="mt-1 text-muted-foreground">Your access has been confirmed. Welcome to Kommune.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {props.step === "pending" && props.activationRef && (
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
              <Heart className="w-5 h-5 text-green-600" />
            </span>
            <div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">SpotMe</div>
              <div className="text-xl font-display">Pay it forward</div>
            </div>
            <div className="ml-auto bg-green-500/10 text-green-600 text-xs font-mono px-3 py-1 rounded-full border border-green-500/20">
              2 for 1
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Your R300 unlocks access for you — and one friend, completely free. Know someone who needs this? Spot them in. This can only be used once.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">You get</div>
              <div className="font-medium">Full access</div>
              <div className="text-xs text-muted-foreground">All 5 agents, activated within 24hrs</div>
            </div>
            <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your friend gets</div>
              <div className="font-medium">Full access</div>
              <div className="text-xs text-muted-foreground">Same as you, completely free</div>
            </div>
          </div>

          {!spotmeSent ? (
            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-foreground/10 bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="Friend's WhatsApp or email"
                value={spotmeContact}
                onChange={(e) => setSpotmeContact(e.target.value)}
              />
              {spotmeError && <div className="text-sm text-red-500">{spotmeError}</div>}
              <Button
                onClick={handleSpotme}
                disabled={!spotmeContact.trim() || spotmeLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full h-12"
              >
                {spotmeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Heart className="w-4 h-4 mr-2" /> Spot My Friend</>}
              </Button>
              <p className="text-xs text-muted-foreground">You can only SpotMe once. Choose wisely.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm">
              <div className="font-medium text-green-600">Spotted!</div>
              <div className="mt-1 text-muted-foreground">We will activate <span className="font-mono">{spotmeContact}</span> alongside you once payment is confirmed.</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}