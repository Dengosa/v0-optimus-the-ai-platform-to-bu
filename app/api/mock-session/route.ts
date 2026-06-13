import { createSessionId } from "@/lib/session";

export async function POST() {
  // No auth for demo; return a sessionId the client can use to fetch/update onboarding & journey.
  return Response.json({ sessionId: createSessionId() });
}


