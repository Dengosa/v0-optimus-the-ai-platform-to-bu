"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { ArrowRight, AlertTriangle, Loader2, Send, ShieldCheck, Users, Zap } from "lucide-react";

type SuggestedPrompt = {
  agent: string;
  text: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AgentDemoSection() {
  const { messages, isStreaming, error, previewMode, sendMessage } = useChat();
  const [draft, setDraft] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts: SuggestedPrompt[] = useMemo(
    () => [
      { agent: "Lex / Rex", text: "My documents are missing—what should I do first?" },
      { agent: "Vita", text: "I need help understanding my healthcare options." },
      { agent: "Opportunity", text: "I want to learn a trade and find training programs." },
      { agent: "Journey Engine", text: "Help me plan my next steps for moving forward." },
    ],
    []
  );

  const handleSend = async () => {
    const content = draft;
    setDraft("");
    await sendMessage(content);
  };

  // Auto-scroll the feed to the latest message/stream as content arrives,
  // the way a real phone chat would.
  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isStreaming]);

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <section id="demo" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Ambient glow seeded behind the device -- two independently drifting
          blobs, kept within the real brand palette (acid green + off-white).
          Purely decorative: aria-hidden, pointer-events-none, no effect on
          layout or any data flow below. */}
      <style jsx>{`
        @keyframes demoGlowDrift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.08);
          }
          66% {
            transform: translate(-20px, 25px) scale(0.95);
          }
        }
      `}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute left-[18%] top-[24%] w-[680px] h-[680px] rounded-full opacity-[0.18] blur-[100px]"
        style={{
          background: "radial-gradient(circle, #b8ff57, transparent 70%)",
          animation: "demoGlowDrift 14s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[14%] top-1/2 w-[460px] h-[460px] rounded-full opacity-[0.10] blur-[90px]"
        style={{
          background: "radial-gradient(circle, #f5f5f0, transparent 72%)",
          animation: "demoGlowDrift 18s ease-in-out infinite reverse",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        {previewMode && (
          <div className="mb-8 bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-semibold">Preview mode</div>
                <div className="text-sm opacity-90">

                  Activate to unlock email drafting, appointment scheduling, and ongoing support
                </div>
              </div>
            </div>
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Link href="/activate">
                Activate <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

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
            Watch how Kommune&apos;s AI agents analyze situations, identify pathways, generate actions
            and help migrants move forward.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ---------------- LEFT: device frame with real chat inside ---------------- */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Device shell */}
              <div
                className="relative w-[340px] h-[700px] rounded-[52px] p-[10px]"
                style={{
                  background: "linear-gradient(155deg, #2a2a2a 0%, #0a0a0a 60%)",
                  boxShadow:
                    "0 2px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px -20px rgba(0,0,0,0.55), 0 0 60px -10px rgba(184,255,87,0.08)",
                }}
              >
                {/* Screen */}
                <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-background flex flex-col">
                  {/* Dynamic island */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-30" />

                  {/* Status bar */}
                  <div className="relative pt-[18px] pb-2 px-7 flex items-center justify-between text-[13px] font-medium text-foreground z-20">
                    <span>9:41</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      kommune
                    </span>
                  </div>

                  {/* Chat feed -- real data, unchanged */}
                  <div ref={feedRef} className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 scrollbar-none">
                    {messages.length === 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
                          Suggested
                        </div>
                        <div className="space-y-2">
                          {suggestedPrompts.map((p) => (
                            <button
                              key={p.text}
                              type="button"
                              onClick={() => {
                                setDraft(p.text);
                                setTimeout(() => {
                                  void sendMessage(p.text);
                                  setDraft("");
                                }, 0);
                              }}
                              className="w-full text-left rounded-2xl border border-foreground/10 bg-secondary/40 hover:bg-secondary/70 hover:border-foreground/20 transition-colors px-3.5 py-3 flex items-start gap-2.5"
                            >
                              <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-foreground/10 shrink-0">
                                <Send className="w-3 h-3" />
                              </span>
                              <span className="text-[12.5px] leading-snug">{p.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((m, i) => {
                      if (m.role === "user") {
                        return (
                          <div
                            key={m.id}
                            className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300"
                          >
                            <div className="max-w-[85%] bg-foreground text-background rounded-2xl rounded-tr-md px-3.5 py-2.5">
                              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                        );
                      }

                      const routing = m.routing;
                      const emergency = m.emergency;
                      const isLast = i === messages.length - 1;

                      return (
                        <div
                          key={m.id}
                          className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                          {routing?.agents_involved && routing.agents_involved.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {routing.agents_involved.map((agent) => {
                                const pillClasses =
                                  agent.toLowerCase().includes("lex") || agent.toLowerCase().includes("rex")
                                    ? "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-200"
                                    : agent.toLowerCase().includes("vita")
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-200"
                                      : agent.toLowerCase().includes("opportun")
                                        ? "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-200"
                                        : "bg-foreground/10 border-foreground/20 text-foreground";
                                return (
                                  <span
                                    key={agent}
                                    className={cx("px-2 py-0.5 rounded-full text-[10px] border", pillClasses)}
                                  >
                                    {agent}
                                  </span>
                                );
                              })}
                              {routing?.escalate_ngo && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] border border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-200">
                                  NGO escalation
                                </span>
                              )}
                              {routing?.priority_flagged && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] border border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200">
                                  Priority
                                </span>
                              )}
                            </div>
                          )}

                          {emergency && (emergency.rights?.length || emergency.ngo_name) && (
                            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
                                <div className="font-semibold text-[12px] text-red-700 dark:text-red-200">
                                  Emergency support
                                </div>
                              </div>
                              {emergency.ngo_name && (
                                <div className="text-[11px] text-red-800 dark:text-red-200 mb-1">
                                  NGO: {emergency.ngo_name}
                                </div>
                              )}
                              {emergency.rights && emergency.rights.length > 0 && (
                                <ul className="text-[11px] space-y-0.5">
                                  {emergency.rights.slice(0, 4).map((r) => (
                                    <li key={r} className="flex items-start gap-1.5">
                                      <span className="mt-1 w-1 h-1 rounded-full bg-red-600 dark:bg-red-300 shrink-0" />
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          <div className="bg-secondary/50 border border-foreground/10 rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[92%]">
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                              {m.content}
                              {isStreaming && isLast && (
                                <span className="inline-block w-[2px] h-[14px] bg-foreground/70 ml-0.5 align-middle animate-pulse" />
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {isStreaming && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex items-center gap-1 px-3.5 py-3 bg-secondary/50 border border-foreground/10 rounded-2xl rounded-tl-md w-fit animate-in fade-in duration-200">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
                          style={{ animationDelay: "0ms", animationDuration: "1.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
                          style={{ animationDelay: "150ms", animationDuration: "1.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
                          style={{ animationDelay: "300ms", animationDuration: "1.1s" }}
                        />
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <div className="text-[11.5px] font-medium text-red-700 dark:text-red-200">{error}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="px-3.5 pb-5 pt-2.5 border-t border-foreground/10 bg-background">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={1}
                        placeholder="Ask Kommune..."
                        className="flex-1 bg-secondary/50 border border-foreground/10 rounded-2xl px-3.5 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-foreground/20 resize-none max-h-20"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={isStreaming || !draft.trim()}
                        className="shrink-0 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 transition-opacity"
                      >
                        {isStreaming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-foreground/40 z-30" />
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT: explainer + CTA ---------------- */}
          <div className="max-w-lg lg:max-w-none">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
              How it works
            </span>
            <h3 className="text-3xl lg:text-4xl font-display tracking-tight mb-5 text-balance">
              One conversation, every system involved.
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
              Ask Kommune what&apos;s happening with your documents, your health access, or your next
              steps in plain language. The right specialist agents pick it up automatically, and a human
              reviews anything that matters before it&apos;s finalised.
            </p>

            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/70 border border-foreground/10 shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-medium mb-0.5">Real agents, routed automatically</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Legal, health, and opportunity specialists respond based on what you actually asked.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/70 border border-foreground/10 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-medium mb-0.5">Nothing urgent slips through</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Time-sensitive cases are flagged and routed for human review, not left to wait.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/70 border border-foreground/10 shrink-0">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-medium mb-0.5">Backed by real reviewers</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Every case that needs it reaches an actual person at a partner organisation.
                  </div>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90">
              <Link href="/activate">
                Get access <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
