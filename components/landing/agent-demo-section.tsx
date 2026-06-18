"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { ArrowRight, AlertTriangle, Loader2, Zap, Send } from "lucide-react";

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

  const suggestedPrompts: SuggestedPrompt[] = useMemo(
    () => [
      { agent: "Lex / Rex", text: "My documents are missing—what should I do first?" },
      { agent: "Vita", text: "I need help understanding my healthcare options." },
      { agent: "Opportunity", text: "I want to learn a trade and find training programs." },
      { agent: "Journey Engine", text: "Help me plan my next steps for moving forward." },
    ],
    []
  );

  const lastAssistant = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === "assistant");
  }, [messages]);

  const handleSend = async () => {
    const content = draft;
    setDraft("");
    await sendMessage(content);
  };

  useEffect(() => {
    if (messages.length === 0) return;
    // keep textarea from holding old value after streaming
  }, [messages.length]);

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <section id="demo" className="relative py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
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
                Activate R300 <ArrowRight className="w-4 h-4 ml-2" />
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

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-background border border-foreground/10 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-secondary/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
                <span className="w-3 h-3 rounded-full bg-foreground/15" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">kommune / live simulation</span>
              <div className="text-xs font-mono text-muted-foreground">live</div>
            </div>

            <div className="flex-1 p-5 lg:p-8 space-y-5 min-h-[460px]">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Suggested prompts
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {suggestedPrompts.map((p) => (
                      <Button
                        key={p.text}
                        type="button"
                        variant="outline"
                        className="rounded-xl border-foreground/15 hover:bg-foreground/5 justify-start"
                        onClick={() => {
                          setDraft(p.text);
                          // slight delay so textarea updates, then send
                          setTimeout(() => {
                            void sendMessage(p.text);
                            setDraft("");
                          }, 0);
                        }}
                      >
                        <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-secondary/70">
                          <Send className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-sm">{p.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[80%] bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    );
                  }

                  const routing = m.routing;
                  const emergency = m.emergency;

                  return (
                    <div key={m.id} className="flex flex-col gap-3 animate-char-in" style={{ animationDuration: "0.4s" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          {routing?.agents_involved && routing.agents_involved.length > 0 && (
                            <div className="flex flex-wrap gap-2">
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
                                    className={cx(
                                      "px-3 py-1 rounded-full text-xs border",
                                      pillClasses
                                    )}
                                  >
                                    {agent}
                                  </span>
                                );
                              })}

                              {routing?.escalate_ngo && (
                                <span className="px-3 py-1 rounded-full text-xs border border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-200">
                                  Escalation to NGO
                                </span>
                              )}

                              {routing?.priority_flagged && (
                                <span className="px-3 py-1 rounded-full text-xs border border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200">
                                  Priority case
                                </span>
                              )}
                            </div>
                          )}

                          {emergency && (emergency.rights?.length || emergency.ngo_name) && (
                            <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-300" />
                                <div className="font-semibold text-red-700 dark:text-red-200">Emergency support</div>
                              </div>
                              {emergency.ngo_name && (
                                <div className="text-sm text-red-800 dark:text-red-200 mb-2">NGO: {emergency.ngo_name}</div>
                              )}
                              {emergency.rights && emergency.rights.length > 0 && (
                                <ul className="text-sm space-y-1">
                                  {emergency.rights.slice(0, 6).map((r) => (
                                    <li key={r} className="flex items-start gap-2">
                                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-300" />
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="max-w-[92%]">
                          <div className="prose prose-sm dark:prose-invert">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isStreaming && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Kommune is composing...
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse align-middle" />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <div className="text-sm font-medium text-red-700 dark:text-red-200">{error}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 lg:px-8 py-5 border-t border-foreground/10 bg-secondary/30">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      rows={2}
                      placeholder="Ask about documents, healthcare, opportunities, or next steps..."
                      className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      Enter to send · Shift+Enter newline
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={isStreaming || !draft.trim()}
                  className="rounded-full px-5 bg-foreground hover:bg-foreground/90 text-background"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-background border border-foreground/10 rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Active agents</span>
              <span className="flex items-center gap-2 text-xs font-mono text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {(() => {
                const agents = lastAssistant?.routing?.agents_involved ?? [];
                const uniq = Array.from(new Set(agents)).slice(0, 5);
                const fallback = ["Lex / Rex", "Vita", "Opportunity", "Journey Engine"];
                const shown = uniq.length ? uniq : fallback;
                return shown.map((a) => {
                  const isOn = shown.includes(a);
                  return (
                    <div
                      key={a}
                      className={cx(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                        isOn ? "border-foreground/30 bg-secondary/50" : "border-foreground/10"
                      )}
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-secondary text-foreground">
                        <Zap className="w-5 h-5" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{a}</div>
                        <div className="font-mono text-xs text-muted-foreground">Processing</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                  );
                });
              })()}
            </div>

            <div className="mt-6 pt-6 border-t border-foreground/10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Journey & Vault</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Journey</span>
                  <span className="text-foreground">{isStreaming ? "Updating" : "Tracking"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vault</span>
                  <span className="text-foreground">{isStreaming ? "Adding documents" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

