/*
 * Kommune chat hook.
 * Manages streaming SSE responses from POST /chat/stream.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { streamKommuneChat, type KommuneState, type StreamChatPayload } from "@/lib/api";


type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  // metadata per assistant message
  routing?: {
    agent?: string;
    agents_involved?: string[];
    preview_mode?: boolean;
    escalate_ngo?: boolean;
    priority_flagged?: boolean;
  };
  emergency?: {
    ngo_name?: string;
    rights?: string[];
  };
};

type UseChatOptions = {
  initialHistory?: ChatMessage[];
  userId?: string;
  sessionIdKey?: string;
};

function createUuid() {
  // Prefer crypto.randomUUID where available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();

  // fallback
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function useChat(options?: UseChatOptions) {
  const initialHistory = options?.initialHistory ?? [];
  const userId = options?.userId;
  const sessionStorageKey = options?.sessionIdKey ?? "kommune_session_id";

  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Granular Kommune state (used by UI; populated from streamed KommuneState).
  const [diagnostic, setDiagnostic] = useState<any>(undefined);
  const [allAlternatives, setAllAlternatives] = useState<any>(undefined);
  const [lexRecommendation, setLexRecommendation] = useState<any>(undefined);
  const [immediateActions, setImmediateActions] = useState<any>(undefined);


  const streamAbortRef = useRef<AbortController | null>(null);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const existing = sessionStorage.getItem(sessionStorageKey);
    if (existing) return existing;
    const id = createUuid();
    sessionStorage.setItem(sessionStorageKey, id);
    return id;
  }, [sessionStorageKey]);

  // Ensure we only create session id once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = sessionStorage.getItem(sessionStorageKey);
    if (existing) return;
    const id = createUuid();
    sessionStorage.setItem(sessionStorageKey, id);
  }, [sessionStorageKey]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setPreviewMode(false);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(sessionStorageKey);
        const id = createUuid();
        sessionStorage.setItem(sessionStorageKey, id);
      }
    }, 0);
  }, [sessionStorageKey]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setError(null);
      setIsStreaming(true);

      // Cancel any previous stream
      if (streamAbortRef.current) {
        try {
          streamAbortRef.current.abort();
        } catch {
          // ignore
        }
      }

      const mySessionId =
        typeof window === "undefined" ? undefined : sessionStorage.getItem(sessionStorageKey) ?? undefined;

      const userMessage: ChatMessage = {
        id: createUuid(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      const assistantMessageId = createUuid();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      // Append messages immediately for nicer UX
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        // Abort any previous in-flight stream.
        if (streamAbortRef.current) {
          try {
            streamAbortRef.current.abort();
          } catch {
            // ignore
          }
        }

        streamAbortRef.current = new AbortController();
        const { signal } = streamAbortRef.current;

        // Build payload for streamKommuneChat.
        const history = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        const payload: StreamChatPayload = {
          message: content,
          history: [...history, { role: "user", content }],
          user_id: userId,
          session_id: mySessionId,
        };

        // Consume async generator and update message content from accumulated KommuneState.
        for await (const kommuneState of streamKommuneChat(payload, signal)) {
          // Fallback strategy: append delta-like fields if present, otherwise stringify last known assistant content.
          const assistantDelta =
            kommuneState?.delta ??
            kommuneState?.message?.delta ??
            kommuneState?.message ??
            "";

          if (typeof assistantDelta === "string" && assistantDelta.length > 0) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessageId ? { ...m, content: m.content + assistantDelta } : m))
            );
          } else if (typeof kommuneState?.assistant_content === "string") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessageId ? { ...m, content: kommuneState.assistant_content } : m))
            );
          }

          // Granular Kommune state mapping.
          setDiagnostic(kommuneState?.diagnostic);
          setAllAlternatives(kommuneState?.allAlternatives ?? kommuneState?.all_alternatives);
          setLexRecommendation(
            kommuneState?.lexRecommendation ?? kommuneState?.lex_recommendation
          );
          setImmediateActions(
            kommuneState?.immediateActions ?? kommuneState?.immediate_actions
          );

          if (typeof kommuneState?.preview_mode === "boolean") {
            setPreviewMode(!!kommuneState.preview_mode);
          }
        }


        setIsStreaming(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setIsStreaming(false);
      }

    },
    [messages, sessionStorageKey, userId]
  );

  // If callers pass initialHistory, preview mode might need to be initialized from it.
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.routing);
    if (lastAssistant?.routing?.preview_mode !== undefined) setPreviewMode(!!lastAssistant.routing.preview_mode);
  }, [messages]);

  // Cleanup: abort the current stream on unmount.
  useEffect(() => {
    return () => {
      if (streamAbortRef.current) {
        try {
          streamAbortRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);


  return {
    messages,
    isStreaming,
    error,
    previewMode,

    diagnostic,
    allAlternatives,
    lexRecommendation,
    immediateActions,

    sendMessage,
    reset,
  };

}

