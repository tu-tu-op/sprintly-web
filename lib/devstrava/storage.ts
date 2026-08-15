import { DEMO_SESSIONS, DEMO_USER } from "./demo-data";
import { validateDevStravaImport, type DevStravaSession } from "./contract";
import type { ShareField } from "./analytics";

export type StoredSession = {
  record: DevStravaSession;
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

const key = (userId: string, resource: string) => `devstrava:${userId}:${resource}:v1`;

const defaultPreferences: UserPreferences = {
  profileVisibility: "private",
  leaderboardOptIn: false,
  leaderboardScope: "global",
  syncPreference: "selected",
  showTokenUsage: false,
  showTerminalActivity: false,
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

function loadSessions(userId: string) {
  const raw = read<unknown>(key(userId, "sessions"), null);
  if (raw === null) return fallbackStoredSessions;
  if (!Array.isArray(raw)) return fallbackStoredSessions;
  const validated = raw.flatMap((item) => {
    if (!item || typeof item !== "object" || !("record" in item)) return [];
    const candidate = item as { record?: unknown; source?: unknown; importedAt?: unknown; verified?: unknown };
    const result = validateDevStravaImport(candidate.record);
    if (!result.sessions.length || result.issues.length) return [];
    return [{
      record: result.sessions[0],
      source: candidate.source === "imported" ? "imported" as const : "demo" as const,
      importedAt: typeof candidate.importedAt === "string" ? candidate.importedAt : new Date().toISOString(),
      verified: candidate.verified === true,
    }];
  });
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
