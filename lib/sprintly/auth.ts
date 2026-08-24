export const DEMO_CREDENTIALS = {
  email: "demo@sprintly.local",
  password: "SprintlyDemo123!",
} as const;

const LEGACY_DEMO_CREDENTIALS = {
  email: "demo@devstrava.local",
  password: "DevStravaDemo123!",
} as const;

export type AuthSession = {
  userId: string;
  email: string;
  displayName: string;
  mode: "demo";
  issuedAt: string;
};

export type AuthProvider = {
  signIn: (email: string, password: string) => Promise<{ ok: true; session: AuthSession } | { ok: false; error: string }>;
};

const AUTH_STORAGE_KEY = "sprintly:auth:v1";
const DEFAULT_NEXT_PATH = "/app";

// Restricts the post-sign-in redirect target to a same-origin internal
// path. Rejects schemes (including javascript:), protocol-relative and
// backslash forms, control characters, and oversized values.
export function sanitizeNextPath(raw: string | null | undefined, fallbackPath: string = DEFAULT_NEXT_PATH) {
  const candidate = typeof raw === "string" ? raw.trim() : "";
  if (!candidate || candidate.length > 512) return fallbackPath;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) return fallbackPath;
  if (candidate.includes("\\")) return fallbackPath;
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return fallbackPath;
  if (/^\/[^/?]*:/.test(candidate)) return fallbackPath;
  return candidate.replace(/\/{2,}/g, "/");
}

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return false;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    return true;
  } catch { /* Storage can be disabled; callers must surface that instead of failing silently. */
    return false;
  }
}

export const demoAuthProvider: AuthProvider = {
  async signIn(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const currentCredentialsMatch = normalizedEmail === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
    const legacyCredentialsMatch = normalizedEmail === LEGACY_DEMO_CREDENTIALS.email && password === LEGACY_DEMO_CREDENTIALS.password;
    if (!currentCredentialsMatch && !legacyCredentialsMatch) {
      return { ok: false, error: "Use the marked Demo Account credentials for this development build." };
    }
    const session: AuthSession = {
      userId: "demo-user",
      email: DEMO_CREDENTIALS.email,
      displayName: "Alex Rivera",
      mode: "demo",
      issuedAt: new Date().toISOString(),
    };
    const persisted = writeStorage(AUTH_STORAGE_KEY, JSON.stringify(session));
    if (!persisted) {
      return { ok: false, error: "This browser is blocking local storage, so the session cannot be kept. Allow storage for this site and try again." };
    }
    return { ok: true, session };
  },
};

export function getAuthSession(): AuthSession | null {
  const raw = readStorage(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (parsed.userId !== "demo-user" || parsed.mode !== "demo" || typeof parsed.email !== "string" || typeof parsed.displayName !== "string") return null;
    return parsed as AuthSession;
  } catch { return null; }
}

export function clearAuthSession() { writeStorage(AUTH_STORAGE_KEY, null); }
