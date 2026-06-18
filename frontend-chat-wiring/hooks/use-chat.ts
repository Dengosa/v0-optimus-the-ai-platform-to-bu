"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { streamChat, type ChatMessage, type RoutingInfo, type EmergencyInfo } from "@/lib/api";

export interface DisplayMessage extends ChatMessage {
  routing?: RoutingInfo;
  emergency?: EmergencyInfo;
  isStreaming?: boolean;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "kommune_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useChat(userId?: string) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const historyRef = useRef<ChatMessage[]>([]);
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getOrCreateSessionId();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      const userMessage: DisplayMessage = { role: "user", content: text };
      const assistantMessage: DisplayMessage = {
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const history = [...historyRef.current];
      historyRef.current = [...history, { role: "user", content: text }];

      await streamChat(
        text,
        history,
        {
          onRouting: (routing) => {
            setPreviewMode(routing.preview_mode);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                routing,
              };
              return updated;
            });
          },
          onEmergency: (emergency) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                emergency,
              };
              return updated;
            });
          },
          onDelta: (delta) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                content: last.content + delta,
              };
              return updated;
            });
          },
          onDone: () => {
            setIsStreaming(false);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, isStreaming: false };
              historyRef.current = [
                ...historyRef.current,
                { role: "assistant", content: last.content },
              ];
              return updated;
            });
          },
          onError: (err) => {
            setIsStreaming(false);
            setError(err.message);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                isStreaming: false,
              };
              return updated;
            });
          },
        },
        {
          userId,
          sessionId: sessionId.current,
        }
      );
    },
    [isStreaming, userId]
  );

  const reset = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
    setPreviewMode(false);
    sessionId.current = getOrCreateSessionId();
  }, []);

  return { messages, sendMessage, isStreaming, error, previewMode, reset };
}
