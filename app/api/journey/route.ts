import { getOrCreateOnboarding, getOrCreateJourney, updateJourney } from "@/lib/mock-store";

function getSessionId(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("sessionId") || "demo-session";
}

export async function GET(req: Request) {
  const sessionId = getSessionId(req);
  const onboarding = getOrCreateOnboarding(sessionId);
  const journey = getOrCreateJourney(sessionId);

  // Simple mock logic: once call is confirmed, agents become Ready.
  const confirmed = onboarding.confirmed;
  const phase = onboarding.step;

  if (phase === "call" && confirmed) {
    updateJourney(sessionId, {
      agents: {
        legal: { status: "Ready" },
        opportunity: { status: "Ready" },
        health: { status: "Ready" },
        credit: { status: "Ready" },
      },
      journeyStatus: "Ready",
      vaultStatus: "Ready",
    });
  } else {
    // Keep initializing until confirm.
    updateJourney(sessionId, {
      agents: {
        legal: { status: "Initializing" },
        opportunity: { status: "Initializing" },
        health: { status: "Initializing" },
        credit: { status: "Initializing" },
      },
      journeyStatus: phase === "call" ? "Creating" : "Creating",
    });
  }

  return Response.json({ ok: true, sessionId, onboarding, journey: getOrCreateJourney(sessionId) });
}

