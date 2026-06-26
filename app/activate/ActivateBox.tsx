"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, QrCode, RefreshCcw, ShieldCheck } from "lucide-react";

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
  const canSubmit = useMemo(() => {
    const hasEmail = props.email.trim().length > 3;
    const hasWhatsapp = props.whatsappNumber.trim().length > 3;
    return (hasEmail || hasWhatsapp) && !props.isProcessing;
  }, [props.email, props.whatsappNumber, props.isProcessing]);

  return (
    <section id="get-access" className="mt-10">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Kommune Access
              </div>
              <h2 className="mt-3 text-2xl font-display">Get Access</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Submit email or WhatsApp. You’ll receive a QR reference and instructions.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 bg-foreground/5 border border-foreground/10">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="font-mono text-xs text-muted-foreground">24/7 workflow</span>
            </div>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              props.onSubmit();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email (optional)</label>
              <input
                className="w-full rounded-xl border border-foreground/10 bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                value={props.email}
                onChange={(e) => props.setEmail(e.target.value)}
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                autoComplete="email"
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
                inputMode="tel"
                placeholder="+27 82 123 4567"
                autoComplete="tel"
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
                ) : (
                  "Request Activation"
                )}
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
              Your information is used only to create a reference for activation.
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
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Reference
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="font-mono text-sm text-foreground break-all">
                  {props.activationRef ?? "—"}
                </div>
                {props.step === "confirmed" && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                Backend status: {props.status ?? "—"}
              </div>
            </div>

            {props.qrCodeUrl ? (
              <div className="flex items-center justify-center rounded-xl border border-foreground/10 bg-secondary/30 p-4">
                {/* Keep styling simple; backend provides a URL */}
                <img src={props.qrCodeUrl} alt="Activation QR Code" className="w-56 h-56" />
              </div>
            ) : (
              <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-4 text-sm text-muted-foreground">
                Submit the form to generate your QR.
              </div>
            )}

            <div className="rounded-xl border border-foreground/10 bg-background p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Instructions
              </div>
              <div className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                {props.instructions ?? "—"}
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              Polling runs every 10 seconds until the backend confirms activation.
            </div>

            {props.step === "confirmed" && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm">
                <div className="font-medium text-green-600">Activated!</div>
                <div className="mt-1 text-muted-foreground">
                  Your access has been confirmed. You can continue to your workspace.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

