export const DEMO_CREDENTIALS = {
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

const AUTH_STORAGE_KEY = "devstrava:auth:v1";

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* Storage can be disabled; the UI still remains usable for this session. */ }
}

export const demoAuthProvider: AuthProvider = {
  async signIn(email, password) {
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return { ok: false, error: "Use the marked Demo Account credentials for this development build." };
    }
    const session: AuthSession = {
      userId: "demo-user",
      email: DEMO_CREDENTIALS.email,
      displayName: "Alex Rivera",
      mode: "demo",
      issuedAt: new Date().toISOString(),
    };
    writeStorage(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  },
};

export function getAuthSession(): AuthSession | null {
  const raw = readStorage(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (parsed.userId !== "demo-user" || parsed.mode !== "demo" || typeof parsed.email !== "string") return null;
    return parsed as AuthSession;
  } catch { return null; }
}

export function clearAuthSession() { writeStorage(AUTH_STORAGE_KEY, null); }
