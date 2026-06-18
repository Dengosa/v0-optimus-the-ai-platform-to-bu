const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface WaitlistPayload {
  email: string;
  name?: string;
  city?: string;
  source?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RoutingInfo {
  agent: string | null;
  escalate_ngo: boolean;
  ngo: string | null;
  agents_involved: string[];
  priority_flagged: boolean;
  priority_reason: string | null;
  preview_mode: boolean;
}

export interface EmergencyInfo {
  event_id: string;
  reason: string;
  checklist: {
    title: string;
    items: string[];
    ngo: string | null;
  } | null;
  ngo: string | null;
}

export interface ActivationRequestResponse {
  reference: string;
  amount_zar: number;
  qr_code_url: string;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------
export async function joinWaitlist(payload: WaitlistPayload) {
  const res = await fetch(`${API_URL}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to join waitlist");
  }
  return res.json();
}

export async function getWaitlistCount(): Promise<number> {
  const res = await fetch(`${API_URL}/waitlist/count`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------
export async function requestActivation(payload: {
  email?: string;
  whatsapp_number?: string;
}): Promise<ActivationRequestResponse> {
  const res = await fetch(`${API_URL}/activate/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to request activation");
  }
  return res.json();
}

export async function getActivationStatus(
  reference: string
): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/activate/status/${reference}`);
  if (!res.ok) return { status: "not_found" };
  return res.json();
}

// ---------------------------------------------------------------------------
// Chat streaming
// ---------------------------------------------------------------------------
export async function streamChat(
  message: string,
  history: ChatMessage[],
  handlers: {
    onRouting?: (info: RoutingInfo) => void;
    onEmergency?: (info: EmergencyInfo) => void;
    onDelta?: (delta: string) => void;
    onDone?: () => void;
    onError?: (err: Error) => void;
  },
  options?: {
    userId?: string;
    sessionId?: string;
  }
) {
  try {
    const res = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        user_id: options?.userId,
        session_id: options?.sessionId,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const evt of events) {
        const lines = evt.split("\n");
        let eventName = "message";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) eventName = line.slice(7).trim();
          if (line.startsWith("data: ")) data = line.slice(6).trim();
        }

        if (!data) continue;

        try {
          const parsed = JSON.parse(data);
          if (eventName === "routing") {
            handlers.onRouting?.(parsed as RoutingInfo);
          } else if (eventName === "emergency") {
            handlers.onEmergency?.(parsed as EmergencyInfo);
          } else if (eventName === "message") {
            handlers.onDelta?.(parsed.delta as string);
          } else if (eventName === "done") {
            handlers.onDone?.();
          }
        } catch {
          // malformed SSE frame — ignore
        }
      }
    }
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
