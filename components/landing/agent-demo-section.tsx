"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Scale,
  GraduationCap,
  HeartPulse,
  CreditCard,
  Info,
} from "lucide-react";

type AgentKey = "legal" | "opportunity" | "health" | "credit";

type ScenarioPhase = "idle" | "typing" | "thinking" | "steps" | "results" | "complete";

interface Scenario {
  agentKey: AgentKey;
  agentName: string;
  userMessage: string;
  analyzingLabel: string;
  steps: string[];
  results: { label: string; value: string }[];
  actions: string[];
  journey: { label: string; delta: string };
  nextGoal?: string;
  cta: string;
}

const scenarios: Scenario[] = [
  {
    agentKey: "legal",
    agentName: "Legal Agent",
    userMessage: "My passport expired and I don't know what to do.",
    analyzingLabel: "Analyzing Documents",
    steps: [
      "✓ Passport Status Identified",
      "✓ Immigration Status Reviewed",
      "✓ Renewal Pathway Generated",
    ],
    results: [
      { label: "Status", value: "Passport Expired" },
      { label: "Risk Level", value: "Medium" },
    ],
    actions: [
      "✓ Passport Renewal Checklist",
      "✓ Embassy Contact Template",
      "✓ Required Documents List",
    ],
    journey: { label: "Legal Readiness", delta: "+12%" },
    nextGoal: "Restore Passport Validity",
    cta: "View Full Assessment",
  },
  {
    agentKey: "opportunity",
    agentName: "Opportunity Agent",
    userMessage: "I want to study Architecture.",
    analyzingLabel: "Analyzing Goal",
    steps: [
      "✓ Career Pathway Generated",
      "✓ Universities Identified",
      "✓ Bursaries Found",
    ],
    results: [
      { label: "Recommended Universities", value: "4 matched" },
      { label: "Funding Opportunities", value: "7 found" },
    ],
    actions: [
      "Recommended Universities",
      "Estimated Costs",
      "Application Timeline",
    ],
    journey: { label: "Education Readiness", delta: "+18%" },
    nextGoal: "Prepare University Applications",
    cta: "View Opportunity Plan",
  },
  {
    agentKey: "legal",
    agentName: "Legal Agent",
    userMessage: "I have a birth certificate but no ID.",
    analyzingLabel: "Analyzing Identity Status",
    steps: [
      "✓ Documentation Reviewed",
      "✓ Similar Case Patterns Identified",
      "✓ Action Plan Generated",
    ],
    results: [
      { label: "Status", value: "Identity Documentation Delay" },
      { label: "Risk Level", value: "Medium" },
    ],
    actions: [
      "✓ Home Affairs Escalation Pack",
      "✓ Document Checklist",
      "✓ Follow-Up Timeline",
    ],
    journey: { label: "Legal Readiness", delta: "+15%" },
    nextGoal: "Secure Identity Documentation",
    cta: "View Action Plan",
  },
];

const agentMeta: Record<AgentKey, { name: string; icon: typeof Scale }> = {
  legal: { name: "Legal Agent", icon: Scale },
  opportunity: { name: "Opportunity Agent", icon: GraduationCap },
  health: { name: "Health Agent", icon: HeartPulse },
  credit: { name: "Credit Agent", icon: CreditCard },
};

// phases: 0 idle, 1 user typing, 2 thinking, 3 steps revealing, 4 results, 5 done
function useScenarioPlayer() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [typedUser, setTypedUser] = useState("");
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scenario = scenarios[scenarioIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      clearTimers();
      return;
    }
    // reset state for this scenario
    setPhase(1);
    setTypedUser("");
    setRevealedSteps(0);

    const msg = scenario.userMessage;
    let charIndex = 0;

    const typeChar = () => {
      charIndex++;
      setTypedUser(msg.slice(0, charIndex));
      if (charIndex < msg.length) {
        timers.current.push(setTimeout(typeChar, 35));
      } else {
        // move to thinking
        timers.current.push(
          setTimeout(() => {
            setPhase(2);
            timers.current.push(
              setTimeout(() => {
                setPhase(3);
                // reveal steps one by one
                let s = 0;
                const revealStep = () => {
                  s++;
                  setRevealedSteps(s);
                  if (s < scenario.steps.length) {
                    timers.current.push(setTimeout(revealStep, 700));
                  } else {
                    timers.current.push(
                      setTimeout(() => {
                        setPhase(4);
                        timers.current.push(
                          setTimeout(() => {
                            setPhase(5);
                            // hold, then advance
                            timers.current.push(
                              setTimeout(() => {
                                setScenarioIndex((i) => (i + 1) % scenarios.length);
                              }, 5000)
                            );
                          }, 900)
                        );
                      }, 600)
                    );
                  }
                };
                revealStep();
              }, 1400)
            );
          }, 500)
        );
      }
    };
    timers.current.push(setTimeout(typeChar, 600));

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioIndex, isVisible]);

  return { scenario, scenarioIndex, phase, typedUser, revealedSteps, containerRef, setScenarioIndex };
}

export function AgentDemoSection() {
  const { scenario, scenarioIndex, phase, typedUser, revealedSteps, containerRef, setScenarioIndex } =
    useScenarioPlayer();

  const activeAgent = scenario.agentKey;

  const statusFor = (key: AgentKey): string => {
    // Match demo spec:
    // - Active agent shows Processing while the simulation is running
    // - Other agents remain Ready/Standby
    const basePhase = phase;
    if (basePhase <= 1) {
      // before typing completes
      return key === activeAgent ? "Ready" : "Standby";
    }

    if (key === activeAgent) {
      if (basePhase >= 2 && basePhase < 5) return "Processing";
      if (basePhase >= 5) return "Complete";
      return "Processing";
    }

    // Non-active agents
    if (key === "opportunity") return "Ready";
    if (key === "legal") return "Ready";
    return "Standby";
  };

  return (
    <section id="demo" ref={containerRef} className="relative py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            See Kommune in action
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6 text-balance">
            From question to action in minutes.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
            Watch how Kommune&apos;s AI agents analyze situations, identify pathways, generate
            actions and help migrants move forward.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Conversation simulation */}
          <div className="lg:col-span-3 bg-background border border-foreground/10 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-secondary/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">kommune / live simulation</span>
              <div className="flex gap-1.5">
                {scenarios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setScenarioIndex(i)}
                    aria-label={`Scenario ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === scenarioIndex ? "w-6 bg-foreground" : "w-1.5 bg-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Chat body */}
            <div className="flex-1 p-5 lg:p-8 space-y-5 min-h-[460px]">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    {typedUser}
                    {phase === 1 && <span className="inline-block w-1.5 h-4 bg-background/70 ml-0.5 animate-pulse align-middle" />}
                  </p>
                </div>
              </div>

              {/* Agent response */}
              {phase >= 2 && (
                <div className="flex flex-col gap-4 animate-char-in" style={{ animationDuration: "0.4s" }}>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <AgentIcon agentKey={scenario.agentKey} />
                    {scenario.agentName}
                  </div>

                  {/* Thinking */}
                  {phase === 2 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      {scenario.analyzingLabel}...
                    </div>
                  )}

                  {/* Steps */}
                  {phase >= 3 && (
                    <div className="space-y-2">
                      {scenario.steps.map((step, i) => (
                        <div
                          key={step}
                          className={`flex items-center gap-2 text-sm transition-all duration-500 ${
                            i < revealedSteps ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                          }`}
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="text-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {phase >= 4 && (
                    <div className="border border-foreground/10 rounded-xl p-4 space-y-4 animate-char-in" style={{ animationDuration: "0.4s" }}>
                      <div className="grid grid-cols-2 gap-3">
                        {scenario.results.map((r) => (
                          <div key={r.label}>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                              {r.label}
                            </div>
                            <div className="text-sm font-medium text-foreground">{r.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-foreground/10 pt-3">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Actions created
                        </div>
                        <div className="space-y-1.5">
                          {scenario.actions.map((a) => (
                            <div key={a} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-3.5 h-3.5 text-foreground/70" />
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>

      <div className="flex items-center justify-between border-t border-foreground/10 pt-3">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                            Journey updated
                          </div>
                          <div className="text-sm text-foreground">
                            {scenario.journey.label}{" "}
                            <span className="font-medium text-green-600">{scenario.journey.delta}</span>
                          </div>
                        </div>
                        {scenario.nextGoal && (
                          <div className="text-right">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                              Next goal
                            </div>
                            <div className="text-sm text-foreground">{scenario.nextGoal}</div>
                          </div>
                        )}
                      </div>

                      {/* Scenario CTA */}
                      <div className="pt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                          <Info className="w-4 h-4" />
                          {" "}
                          {scenario.cta}
                        </span>
                        <Button
                          asChild
                          variant="outline"
                          className="ml-auto rounded-full border-foreground/20 hover:bg-foreground/5"
                        >
                          <Link href="/journey">
                            {scenario.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA footer */}
            <div className="flex flex-col sm:flex-row items-center gap-3 px-5 lg:px-8 py-5 border-t border-foreground/10 bg-secondary/30">
              <span className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
                This is a live simulation. Activate to get your own agents.
              </span>
              <Button asChild className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-6 group w-full sm:w-auto">
                <Link href="/activate">
                  Activate access
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Agent activity panel */}
          <div className="lg:col-span-2 bg-background border border-foreground/10 rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Active agents
              </span>
              <span className="flex items-center gap-2 text-xs font-mono text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {(Object.keys(agentMeta) as AgentKey[]).map((key) => {
                const meta = agentMeta[key];
                const Icon = meta.icon;
                const status = statusFor(key);
                const isActive = key === activeAgent && phase >= 2 && phase < 5;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isActive
                        ? "border-foreground/30 bg-secondary/50"
                        : "border-foreground/10"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors duration-500 ${
                        isActive ? "bg-foreground text-background" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{meta.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{status}</div>
                    </div>
                    <StatusDot status={status} />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-foreground/10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Journey & Vault
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Journey</span>
                  <span className="text-foreground">{phase >= 4 ? "Updating" : "Tracking"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vault</span>
                  <span className="text-foreground">{phase >= 4 ? "Documents added" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentIcon({ agentKey }: { agentKey: AgentKey }) {
  const Icon = agentMeta[agentKey].icon;
  return (
    <span className="flex items-center justify-center w-5 h-5 rounded bg-foreground text-background">
      <Icon className="w-3 h-3" />
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "Processing"
      ? "bg-amber-500 animate-pulse"
      : status === "Complete"
      ? "bg-green-500"
      : status === "Ready"
      ? "bg-foreground/30"
      : "bg-foreground/15";
  return <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />;
}
