import { DEMO_SESSIONS, DEMO_USER } from "./demo-data";
import { validateSprintlyImport, type SprintlySession } from "./contract";
import type { ShareField } from "./analytics";

export type StoredSession = {
  record: SprintlySession;
  source: "demo" | "imported";
  importedAt: string;
  verified: boolean;
};

export type SyncPreference = "never" | "selected" | "completed" | "leaderboard";

export type UserPreferences = {
  profileVisibility: "public" | "private";
  leaderboardOptIn: boolean;
  leaderboardScope: "global" | "country" | "region" | "city" | "friends";
  syncPreference: SyncPreference;
  showTokenUsage: boolean;
  showTerminalActivity: boolean;
  timeZone: string;
};

export type UserProfile = {
  displayName: string;
  handle: string;
  city: string;
  region: string;
  country: string;
  bio: string;
  avatarStyle: "gradient" | "mono" | "signal";
};

export type ShareSnapshot = {
  id: string;
  ownerId: string;
  createdAt: string;
  kind: "session" | "weekly" | "achievement" | "profile";
  title: string;
  selectedFields: ShareField[];
  payload: {
    codingTime?: string;
    archetype?: string;
    codingMix?: { manual: number; aiAssisted: number; automation: number };
    recovery?: number;
    failures?: number;
    tokenUsage?: number;
    terminalActivity?: number;
    devScore?: number;
    streak?: number;
  };
};

export type UserData = {
  sessions: StoredSession[];
  preferences: UserPreferences;
  profile: UserProfile;
  shares: ShareSnapshot[];
};

const key = (userId: string, resource: string) => `sprintly:${userId}:${resource}:v1`;

// Calendar metrics (today/week/month, streaks, night-owl achievements)
// are computed in this zone unless the user picks another one.
export const DEFAULT_TIME_ZONE = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
})();

const defaultPreferences: UserPreferences = {
  profileVisibility: "private",
  leaderboardOptIn: false,
  leaderboardScope: "global",
  syncPreference: "selected",
  showTokenUsage: false,
  showTerminalActivity: false,
  timeZone: DEFAULT_TIME_ZONE,
};

const defaultProfile: UserProfile = {
  displayName: DEMO_USER.displayName,
  handle: DEMO_USER.handle,
  city: DEMO_USER.city,
  region: DEMO_USER.region,
  country: DEMO_USER.country,
  bio: "Building useful things, one focused session at a time.",
  avatarStyle: "gradient",
};

const fallbackStoredSessions = DEMO_SESSIONS.map((record) => ({ record, source: "demo" as const, importedAt: "2026-08-15T00:00:00.000Z", verified: false }));

function read<T>(storageKey: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}

function write(storageKey: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* The in-memory provider remains usable. */ }
}

// Persists a preference patch without requiring the React provider,
// e.g. from the pre-auth onboarding flow.
export function patchStoredPreferences(userId: string, patch: Partial<UserPreferences>) {
  const storageKey = key(userId, "preferences");
  write(storageKey, { ...defaultPreferences, ...read<Partial<UserPreferences>>(storageKey, {}), ...patch });
}

export type OnboardingSnapshot = {
  goals: string[];
  boundary: string;
  savedAt: string;
};

const ONBOARDING_KEY = "sprintly:onboarding:v1";

export function saveOnboardingSnapshot(snapshot: OnboardingSnapshot) {
  write(ONBOARDING_KEY, snapshot);
}

export function readOnboardingSnapshot(): OnboardingSnapshot | null {
  return read<OnboardingSnapshot | null>(ONBOARDING_KEY, null);
}

// Validation cache: localStorage content rarely changes between visits,
// so reuse the last validated result when the raw payload is identical.
let sessionsCache: { signature: string; userId: string; value: StoredSession[] } | null = null;

function loadSessions(userId: string) {
  const storageKey = key(userId, "sessions");
  let rawText: string | null = null;
  if (typeof window !== "undefined") {
    try { rawText = window.localStorage.getItem(storageKey); } catch { rawText = null; }
  }
  if (rawText === null) return fallbackStoredSessions;
  if (sessionsCache && sessionsCache.userId === userId && sessionsCache.signature === rawText) {
    return sessionsCache.value;
  }
  let raw: unknown = null;
  try { raw = rawText ? JSON.parse(rawText) as unknown : null; } catch { return fallbackStoredSessions; }
  if (!Array.isArray(raw)) return fallbackStoredSessions;
  const validated = raw.flatMap((item) => {
    if (!item || typeof item !== "object" || !("record" in item)) return [];
    const candidate = item as { record?: unknown; source?: unknown; importedAt?: unknown; verified?: unknown };
    const result = validateSprintlyImport(candidate.record);
    if (!result.sessions.length || result.issues.length) return [];
    return [{
      record: result.sessions[0],
      source: candidate.source === "imported" ? "imported" as const : "demo" as const,
      importedAt: typeof candidate.importedAt === "string" ? candidate.importedAt : new Date().toISOString(),
      verified: candidate.verified === true,
    }];
  });
  sessionsCache = { signature: rawText, userId, value: validated };
  return validated;
}

export function loadUserData(userId: string): UserData {
  return {
    sessions: loadSessions(userId),
    preferences: { ...defaultPreferences, ...read<Partial<UserPreferences>>(key(userId, "preferences"), {}) },
    profile: { ...defaultProfile, ...read<Partial<UserProfile>>(key(userId, "profile"), {}) },
    shares: read<ShareSnapshot[]>(key(userId, "shares"), []).filter((share) => share && typeof share.id === "string"),
  };
}

export function saveUserData(userId: string, data: UserData) {
  write(key(userId, "sessions"), data.sessions);
  write(key(userId, "preferences"), data.preferences);
  write(key(userId, "profile"), data.profile);
  write(key(userId, "shares"), data.shares);
}

export function clearUserData(userId: string) {
  if (typeof window === "undefined") return;
  for (const resource of ["sessions", "preferences", "profile", "shares"]) {
    try { window.localStorage.removeItem(key(userId, resource)); } catch { /* ignore storage cleanup failures */ }
  }
}

export function downloadTextFile(filename: string, content: string, mimeType = "application/json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export { defaultPreferences, defaultProfile };
