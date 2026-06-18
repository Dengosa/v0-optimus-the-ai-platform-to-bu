"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Loader2, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";

// ---------------------------------------------------------------------------
// Agent display names and colors
// ---------------------------------------------------------------------------
const AGENT_NAMES: Record<string, string> = {
  legal: "Lex",
  credit: "Rex",
  health: "Vita",
  education: "Opportunity",
  journey: "Journey Engine",
};

const AGENT_COLORS: Record<string, string> = {
  legal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  credit: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  health: "bg-green-500/10 text-green-400 border-green-500/20",
  education: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  journey: "bg-foreground/10 text-foreground/70 border-foreground/10",
};

// ---------------------------------------------------------------------------
// Suggested prompts shown before first message
// ---------------------------------------------------------------------------
const SUGGESTED_PROMPTS = [
  "I have a job offer in Cape Town — do I need asylum or is there a better visa?",
  "My asylum permit expired while I was waiting for renewal. Am I still protected?",
  "Can I open a bank account without a South African ID?",
  "My child was turned away from school. What are their rights?",
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function AgentDemoSection() {
  const { messages, sendMessage, isStreaming, error, previewMode } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="py-24 px-4" id="demo">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            See Kommune in action
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2 className="text-3xl md:text-4xl font-display tracking-tight">
            Ask your agents anything
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Your question routes instantly to the right specialist — Lex for
            legal, Rex for credit, Vita for health. They research, advise, and
            act on your behalf.
          </p>
        </div>

        {/* Preview mode banner */}
        {previewMode && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>
                Preview mode — activate to unlock email drafting, appointment
                scheduling, and ongoing case support.
              </span>
            </div>
            <Link href="/activate">
              <Button
                size="sm"
                className="rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex-shrink-0"
              >
                Activate R300
              </Button>
            </Link>
          </div>
        )}

        {/* Chat window */}
        <div className="rounded-2xl border border-foreground/10 bg-background overflow-hidden">
          {/* Messages area */}
          <div className="min-h-[360px] max-h-[500px] overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Try one of these or ask your own question:
                </p>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      sendMessage(prompt);
                    }}
                    className="w-full text-left rounded-xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 px-4 py-3 text-sm text-foreground/70 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-3 text-sm"
                      : "max-w-[90%] space-y-3"
                  }
                >
                  {msg.role === "assistant" && (
                    <>
                      {/* Emergency alert */}
                      {msg.emergency && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Urgent situation detected
                          </div>
                          {msg.emergency.checklist?.items && (
                            <ul className="space-y-1">
                              {msg.emergency.checklist.items.map((item, j) => (
                                <li key={j} className="text-sm text-foreground/80 flex items-start gap-2">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          {msg.emergency.ngo && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              Escalating to: <span className="text-foreground">{msg.emergency.ngo}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Agent badges */}
                      {msg.routing && (
                        <div className="flex flex-wrap gap-2">
                          {(msg.routing.agents_involved.length > 0
                            ? msg.routing.agents_involved
                            : msg.routing.agent
                            ? [msg.routing.agent]
                            : []
                          ).map((agent) => (
                            <span
                              key={agent}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono ${
                                AGENT_COLORS[agent] ?? "bg-foreground/10 text-foreground/70 border-foreground/10"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              {AGENT_NAMES[agent] ?? agent}
                            </span>
                          ))}
                          {msg.routing.escalate_ngo && msg.routing.ngo && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-mono text-amber-400">
                              Escalating → {msg.routing.ngo}
                            </span>
                          )}
                          {msg.routing.priority_flagged && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-mono text-orange-400">
                              Priority case
                            </span>
                          )}
                        </div>
                      )}

                      {/* Response text */}
                      <div className="rounded-2xl rounded-tl-sm bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-1 h-4 ml-0.5 bg-foreground/40 animate-pulse" />
                        )}
                      </div>
                    </>
                  )}

                  {msg.role === "user" && msg.content}
                </div>
              </div>
            ))}

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error} — please try again.
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-foreground/10 p-4 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lex, Rex, Vita, or your Journey Engine..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
              style={{ maxHeight: "120px" }}
              disabled={isStreaming}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="rounded-xl bg-foreground hover:bg-foreground/90 text-background h-11 w-11 p-0 flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Preview mode — your agents give real answers.{" "}
          <Link href="/activate" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Activate for R300
          </Link>{" "}
          to unlock email drafting, appointment scheduling, and full ongoing support.
        </p>
      </div>
    </section>
  );
}
