export async function getWaitlistCount(): Promise<number> {
  return 0;
}

export type KommuneState = {
  delta?: string;
  message?: string | { delta?: string };
  assistant_content?: string;
  preview_mode?: boolean;
  diagnostic?: any;
  allAlternatives?: any;
  all_alternatives?: any;
  lexRecommendation?: any;
  lex_recommendation?: any;
  immediateActions?: any;
  immediate_actions?: any;
};

export type StreamChatPayload = {
  message: string;
  history: { role: string; content: string }[];
  user_id?: string;
  session_id?: string;
};

export async function* streamKommuneChat(
  payload: StreamChatPayload,
  signal?: AbortSignal
): AsyncGenerator<KommuneState> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok || !res.body) throw new Error(`Backend error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") return;
        try {
          yield JSON.parse(raw) as KommuneState;
        } catch {
          yield { delta: raw };
        }
      }
    }
  }
}

export async function getActivationStatus(reference: string): Promise<{ status: string }> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/activate/status?reference=${reference}`);
    if (!res.ok) return { status: "pending" };
    return res.json();
  } catch {
    return { status: "pending" };
  }
}

export async function requestActivation(payload: { email?: string; whatsapp_number?: string }): Promise<{ reference?: string; qr_code_url?: string; instructions?: string }> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
