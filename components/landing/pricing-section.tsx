"use client";

import { CheckCircle2, MessageSquare, Mail, PhoneCall } from "lucide-react";

export function PricingSection() {
  const PAYMENT_LINK = "https://paystack.com/pay/kommune-access";

  const features = [
    "Full access to the Legal Agent (Labor & Tenant rights guide)",
    "Full access to the Credit Agent (Debt handling & budgeting logic)",
    "Full access to the Education Agent (Upskilling tracks)",
    "Full access to the Resettlement Assessment (Voluntary repatriation planner)",
    "Omnichannel cross-agent memory (remembers context across platforms)",
    "Zero subscription fees — Pay once, use forever",
  ];

  const channels = [
    { name: "WhatsApp", icon: MessageSquare },
    { name: "Email", icon: Mail },
    { name: "SMS & Voice", icon: PhoneCall },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          No subscriptions, no surprises, and absolutely no free trials. One
          payment unlocks your personalized autonomous AI agents across every
          communication layer.
        </p>

        {/* Central Pricing Card */}
        <div className="mt-12 bg-background border border-border rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto text-left">
          <div className="p-8 sm:p-10 border-b border-border bg-gradient-to-b from-background to-muted/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Lifetime Gatekeeper Access
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete multi-agent intelligence operating on your behalf.
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  R300
                </span>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Once-Off
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center h-12 px-6 font-semibold text-md rounded-xl bg-primary text-primary-foreground shadow hover:opacity-95 transition-opacity"
              >
                Activate My Infrastructure
              </a>
            </div>
          </div>

          {/* Included Features and Capabilities */}
          <div className="p-8 sm:p-10">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              What is included:
            </h4>
            <ul className="mt-4 space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Omnichannel Highlights */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                Communicate smoothly via
              </h4>
              <div className="mt-4 flex justify-center items-center gap-8">
                {channels.map((chan) => {
                  const Icon = chan.icon;
                  return (
                    <div
                      key={chan.name}
                      className="flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {chan.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

