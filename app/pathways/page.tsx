"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Scale, Building2, FileCheck, Briefcase, GraduationCap, HeartPulse, Bot } from "lucide-react";

const pathways = [
  {
    icon: Scale,
    title: "Traffic Register Number (TRN)",
    subtitle: "Get a driver's licence with just your passport",
    badge: "Legal",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    description: "A Traffic Register Number lets you get a South African driver's licence using only your passport and valid permit. It is free, available at any traffic department, and almost no one tells migrants this exists. A driver's licence is one of the most powerful identity documents in SA — banks, employers and landlords accept it everywhere.",
    assistant: "Lex, your AI legal assistant",
    assistantColor: "bg-blue-500/10 text-blue-600",
    actions: ["Drafts your TRN application letter", "Tells you exactly what to bring", "Sends the email to the traffic department on your behalf", "Responds formally if an official refuses"],
  },
  {
    icon: Building2,
    title: "Open a bank account without a SA ID",
    subtitle: "TymeBank, Capitec, FNB — passport accepted",
    badge: "Banking",
    badgeColor: "bg-green-500/10 text-green-600 border-green-500/20",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    description: "TymeBank opens with a passport only — no proof of address required. Capitec accepts asylum seeker permits. FNB Easy Account works with a Section 22 permit. Most migrants believe they cannot bank without a SA ID. That is false.",
    assistant: "Rex, your AI finance assistant",
    assistantColor: "bg-green-500/10 text-green-600",
    actions: ["Identifies the right bank for your permit type", "Drafts a cover letter if needed", "Emails the bank branch on your behalf", "Formally disputes unlawful refusals"],
  },
  {
    icon: FileCheck,
    title: "Section 22 — your right to work and study",
    subtitle: "Asylum seekers can work legally while waiting",
    badge: "Legal",
    badgeColor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-600",
    description: "A Section 22 asylum seeker permit gives you the legal right to work and study in South Africa while your refugee status application is processed. Most asylum seekers never exercise this right because nobody tells them.",
    assistant: "Lex, your AI legal assistant",
    assistantColor: "bg-yellow-500/10 text-yellow-600",
    actions: ["Confirms your Section 22 rights in plain language", "Drafts letters to employers who challenge your status", "Emails the employer directly on your behalf", "Files a formal complaint if rights are violated"],
  },
  {
    icon: Briefcase,
    title: "Register a business with your passport",
    subtitle: "No SA ID needed — R175 at CIPC",
    badge: "Business",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    description: "CIPC company registration requires only a passport. It costs R175 and gives you a legal entity for income, contracts and business banking. This is why foreign nationals are registering more businesses in SA than ever before.",
    assistant: "Rex, your AI finance assistant",
    assistantColor: "bg-purple-500/10 text-purple-600",
    actions: ["Walks you through CIPC registration step by step", "Drafts all supporting documents", "Emails CIPC or your bank on your behalf", "Connects you to business banking options"],
  },
  {
    icon: GraduationCap,
    title: "NSFAS and bursaries for refugees",
    subtitle: "Refugee status holders qualify for university funding",
    badge: "Education",
    badgeColor: "bg-foreground/10 text-foreground border-foreground/20",
    iconBg: "bg-foreground/5",
    iconColor: "text-foreground",
    description: "If you hold refugee status, you qualify for NSFAS at South African universities. The Canon Collins Trust funds postgraduate study for nationals from Zimbabwe, Mozambique, Zambia and other SADC countries. Almost nobody in migrant communities knows this.",
    assistant: "Education AI assistant",
    assistantColor: "bg-foreground/5 text-foreground",
    actions: ["Checks your eligibility for NSFAS and bursaries", "Drafts your bursary application", "Emails institutions and follows up on your behalf", "Identifies funding for your nationality and field"],
  },
  {
    icon: HeartPulse,
    title: "Healthcare is your right — regardless of status",
    subtitle: "Public hospitals cannot turn you away",
    badge: "Health",
    badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
    description: "Section 27 of the South African Constitution guarantees emergency healthcare to everyone — including undocumented migrants. Public hospitals cannot legally turn you away. ARV treatment is available at public clinics regardless of immigration status.",
    assistant: "Vita, your AI health assistant",
    assistantColor: "bg-red-500/10 text-red-600",
    actions: ["Finds the nearest clinic for your situation", "Drafts a formal complaint if a hospital refuses you", "Sends the complaint to the hospital on your behalf", "Explains your constitutional health rights"],
  },
];

export default function PathwaysPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-10">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3">Free resource — no login needed</div>
          <h1 className="text-4xl lg:text-6xl font-display tracking-tight mb-4">Know your rights and pathways</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Things most migrants never find out — and what Kommune&apos;s AI assistants do for you. Click any card to see how we handle it.
          </p>
        </div>

        <div className="space-y-3">
          {pathways.map((p, i) => {
            const Icon = p.icon;
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-foreground/10 bg-background overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 p-6 text-left hover:bg-secondary/30 transition-colors"
                >
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${p.iconBg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${p.iconColor}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base">{p.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{p.subtitle}</div>
                  </div>
                  <span className={`hidden sm:inline-flex font-mono text-xs px-3 py-1 rounded-full border ${p.badgeColor} flex-shrink-0`}>
                    {p.badge}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-foreground/10">
                    <p className="text-sm text-muted-foreground leading-relaxed mt-5 mb-5">{p.description}</p>
                    <div className="rounded-xl border border-foreground/10 bg-secondary/30 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${p.assistantColor}`}>
                          <Bot className="w-4 h-4" />
                        </span>
                        <div className="text-sm font-medium">{p.assistant} handles this for you</div>
                      </div>
                      <div className="space-y-2">
                        {p.actions.map((action, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-foreground/5 inline-flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                            </span>
                            <div className="text-sm text-muted-foreground">{action}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="font-medium text-lg mb-1">Kommune handles all of this for you</div>
            <div className="text-sm text-muted-foreground">5 AI assistants. 24/7. R300 once-off. Bring a friend free with SpotMe.</div>
          </div>
          <Link
            href="/activate"
            className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background rounded-full px-6 h-12 text-sm font-medium transition-colors"
          >
            Get access — R300
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
