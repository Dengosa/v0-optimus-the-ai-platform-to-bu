/*
 * Kommune API client.
 * Talks to the FastAPI backend (see backend/app/api/v1/endpoints/*.py).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------
export interface WaitlistPayload {
  email: string;
  name?: string;
  city?: string;
  source?: string;
}

export async function joinWaitlist(payload: WaitlistPayload) {
  const res = await fetch(`${API_URL}/api/v1/waitlist`, {
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
  try {
    const res = await fetch(`${API_URL}/api/v1/waitlist/count`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------
export interface ActivationRequestResponse {
  reference: string;
  amount_zar: number;
  qr_code_url: string;
  instructions: string;
}

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
export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatPayload {
  message: string;
  history: ChatHistoryMessage[];
  user_id?: string;
  session_id?: string;
}

export interface KommuneState {
  agent?: string | null;
  agents_involved?: string[];
  escalate_ngo?: boolean;
  ngo?: string | null;
  priority_flagged?: boolean;
  priority_reason?: string | null;
  preview_mode?: boolean;
  delta?: string;
  event_id?: string;
  reason?: string;
  checklist?: {
    title: string;
    items: string[];
    ngo: string | null;
  } | null;
  _event?: "routing" | "message" | "emergency" | "done";
}

export async function* streamKommuneChat(
  payload: StreamChatPayload,
  signal?: AbortSignal
): AsyncGenerator<KommuneState, void, unknown> {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Server connection failed with status: ${response.status}`);
  }
  if (!response.body) {
    throw new Error("ReadableStream not supported by the browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split("\n\n");
      buffer = frames.pop() || "";

      for (const frame of frames) {
        if (!frame.trim()) continue;

        let eventName: "routing" | "message" | "emergency" | "done" = "message";
        let dataLine = "";

        for (const rawLine of frame.split("\n")) {
          const line = rawLine.trim();
          if (line.startsWith("event:")) {
            eventName = line.slice("event:".length).trim() as typeof eventName;
          } else if (line.startsWith("data:")) {
            dataLine = line.slice("data:".length).trim();
          }
        }

        if (!dataLine) continue;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(dataLine);
        } catch (parseError) {
          console.error("Failed to parse SSE JSON chunk:", dataLine, parseError);
          continue;
        }

        if (eventName === "done") {
          return;
        }

        yield { ...parsed, _event: eventName } as KommuneState;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}