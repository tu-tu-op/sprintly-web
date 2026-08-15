"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/lib/devstrava/auth";
import { validateDevStravaImport, type DevStravaSession } from "@/lib/devstrava/contract";
import { DEMO_USER } from "@/lib/devstrava/demo-data";
import { loadUserData, saveUserData, type ShareSnapshot, type StoredSession, type UserData, type UserPreferences, type UserProfile } from "@/lib/devstrava/storage";

type DevStravaContextValue = UserData & {
  userId: string;
  hydrated: boolean;
  importSessions: (sessions: DevStravaSession[]) => number;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  createShare: (snapshot: ShareSnapshot) => void;
  removeShare: (id: string) => void;
  deleteCloudHistory: () => void;
  deleteAccountData: () => void;
};

const fallback = loadUserData(DEMO_USER.id);
const DevStravaContext = createContext<DevStravaContextValue | null>(null);

export function DevStravaProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>(DEMO_USER.id);
  const [data, setData] = useState<UserData>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const auth = getAuthSession();
    const nextUserId = auth?.userId ?? DEMO_USER.id;
    setUserId(nextUserId);
    setData(loadUserData(nextUserId));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveUserData(userId, data);
  }, [data, hydrated, userId]);

  const value = useMemo<DevStravaContextValue>(() => ({
    ...data,
    userId,
    hydrated,
    importSessions: (sessions) => {
      const existing = new Set(data.sessions.map((item) => item.record.sessionId));
      const additions: StoredSession[] = sessions.filter((session) => !existing.has(session.sessionId)).map((record) => ({ record, source: "imported", importedAt: new Date().toISOString(), verified: Boolean(record.signature && record.publicKeyId) }));
      const added = additions.length;
      if (added) setData((current) => ({ ...current, sessions: [...current.sessions, ...additions] }));
      if (added) toast.success(`${added} session${added === 1 ? "" : "s"} imported`, { description: "Your cloud history is represented by this local demo store." });
      return added;
    },
    updatePreferences: (patch) => setData((current) => ({ ...current, preferences: { ...current.preferences, ...patch } })),
    updateProfile: (patch) => setData((current) => ({ ...current, profile: { ...current.profile, ...patch } })),
    createShare: (snapshot) => setData((current) => ({ ...current, shares: [snapshot, ...current.shares.filter((item) => item.id !== snapshot.id)] })),
    removeShare: (id) => setData((current) => ({ ...current, shares: current.shares.filter((item) => item.id !== id) })),
    deleteCloudHistory: () => setData((current) => ({ ...current, sessions: [] })),
    deleteAccountData: () => setData({ sessions: [], preferences: fallback.preferences, profile: fallback.profile, shares: [] }),
  }), [data, hydrated, userId]);

  return <DevStravaContext.Provider value={value}>{children}</DevStravaContext.Provider>;
}

export function useDevStrava() {
  const context = useContext(DevStravaContext);
  if (!context) throw new Error("useDevStrava must be used inside DevStravaProvider");
  return context;
}
