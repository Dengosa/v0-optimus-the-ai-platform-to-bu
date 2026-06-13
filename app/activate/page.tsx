"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Shield, Mail, MessageCircle, Sms, Vault } from "lucide-react";

const included = [
  { icon: Shield, label: "Legal Agent" },
  { icon: Vault, label: "Opportunity Agent" },
  { icon: MessageCircle, label: "Health Agent" },
  { icon: Shield, label: "Credit Agent" },
  { icon: Vault, label: "Journey" },
  { icon: Vault, label: "Vault" },
  { icon: Mail, label: "Email Support" },
  { icon: MessageCircle, label: "WhatsApp Support" },
  { icon: Sms, label: "SMS Support" },
  { icon: Shield, label: "One Support Pass" },
];

export default function ActivatePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activated, setActivated] = useState(false);

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
              href="/welcome"
              onClick={() => {
                setIsProcessing(true);
                setActivated(true);
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

        <div className="mt-10 text-sm text-muted-foreground">
          By continuing, you agree to the demo onboarding flow. You can open the success pages anytime.
        </div>
      </div>
    </main>
  );
}

