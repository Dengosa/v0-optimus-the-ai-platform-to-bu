import { getOrCreateOnboarding, updateOnboarding, type StepKey } from "@/lib/mock-store";

function getSessionId(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("sessionId") || "demo-session";
}

export async function GET(req: Request) {
  const sessionId = getSessionId(req);
  const state = getOrCreateOnboarding(sessionId);
  return Response.json({ ok: true, sessionId, state });
}

type AdvanceBody = { action: "advance" } | { action: "confirm"; slot?: { label: string; time: string } };

export async function POST(req: Request) {
  const sessionId = getSessionId(req);
  const body = (await req.json().catch(() => ({}))) as Partial<AdvanceBody>;

  const current = getOrCreateOnboarding(sessionId);

  if (body?.action === "advance") {
    const order: StepKey[] = ["whatsapp", "email", "call"];
    const idx = order.indexOf(current.step);
    const nextStep = order[Math.min(idx + 1, order.length - 1)];
    const next = updateOnboarding(sessionId, { step: nextStep });
    return Response.json({ ok: true, sessionId, state: next });
  }

  if (body?.action === "confirm") {
    const slot = (body as any).slot as { label: string; time: string } | undefined;
    const next = updateOnboarding(sessionId, {
      confirmed: true,
      slot,
      step: "call",
    });
    return Response.json({ ok: true, sessionId, state: next });
  }

  // Default: return current
  return Response.json({ ok: true, sessionId, state: current });
}

