export type StepKey = "whatsapp" | "email" | "call";
export type JourneyAgentKey = "legal" | "opportunity" | "health" | "credit" | "journey" | "vault";

export type OnboardingState = {
  step: StepKey;
  confirmed: boolean;
  slot?: { label: string; time: string };
  createdAt: number;
};

export type JourneyState = {
  agents: Record<Exclude<JourneyAgentKey, "journey" | "vault">, { status: string }>;
  journeyStatus: string;
  vaultStatus: string;
  updatedAt: number;
};

type Store = {
  onboardingBySessionId: Map<string, OnboardingState>;
  journeyBySessionId: Map<string, JourneyState>;
};

// In-memory mock store (resets on server restart). Suitable for UI/backend integration work.
const store: Store = {
  onboardingBySessionId: new Map(),
  journeyBySessionId: new Map(),
};

export function getOrCreateOnboarding(sessionId: string): OnboardingState {
  const existing = store.onboardingBySessionId.get(sessionId);
  if (existing) return existing;

  const created: OnboardingState = {
    step: "whatsapp",
    confirmed: false,
    createdAt: Date.now(),
  };

  store.onboardingBySessionId.set(sessionId, created);
  return created;
}

export function updateOnboarding(sessionId: string, patch: Partial<OnboardingState>): OnboardingState {
  const current = getOrCreateOnboarding(sessionId);
  const next: OnboardingState = { ...current, ...patch };
  store.onboardingBySessionId.set(sessionId, next);
  return next;
}

export function getOrCreateJourney(sessionId: string): JourneyState {
  const existing = store.journeyBySessionId.get(sessionId);
  if (existing) return existing;

  const created: JourneyState = {
    agents: {
      legal: { status: "Initializing" },
      opportunity: { status: "Initializing" },
      health: { status: "Initializing" },
      credit: { status: "Initializing" },
    },
    journeyStatus: "Creating",
    vaultStatus: "Ready",
    updatedAt: Date.now(),
  };

  store.journeyBySessionId.set(sessionId, created);
  return created;
}

export function updateJourney(sessionId: string, patch: Partial<JourneyState>): JourneyState {
  const current = getOrCreateJourney(sessionId);
  const next: JourneyState = {
    ...current,
    ...patch,
    agents: patch.agents ? { ...current.agents, ...patch.agents } : current.agents,
    updatedAt: Date.now(),
  };
  store.journeyBySessionId.set(sessionId, next);
  return next;
}

