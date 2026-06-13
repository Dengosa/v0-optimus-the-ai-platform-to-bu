import { getOrCreateOnboarding, updateOnboarding } from "@/lib/mock-store";

function getSessionId(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("sessionId") || "demo-session";
}

export async function POST(req: Request) {
  const sessionId = getSessionId(req);

  // Mock activation: mark onboarding as created and return next instructions.
  getOrCreateOnboarding(sessionId);
  updateOnboarding(sessionId, { step: "whatsapp", confirmed: false });

  return Response.json({
    ok: true,
    sessionId,
    message: "Activated (mock). Onboarding has started." ,
  });
}

