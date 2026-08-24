"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAuthSession } from "@/lib/sprintly/auth";
import type { SprintlySession } from "@/lib/sprintly/contract";
import { DEMO_USER } from "@/lib/sprintly/demo-data";
import { loadUserData, saveUserData, type ShareSnapshot, type StoredSession, type UserData, type UserPreferences, type UserProfile } from "@/lib/sprintly/storage";

type SprintlyContextValue = UserData & {
  userId: string;
  hydrated: boolean;
  importSessions: (sessions: SprintlySession[]) => number;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  createShare: (snapshot: ShareSnapshot) => void;
  removeShare: (id: string) => void;
  deleteCloudHistory: () => void;
  deleteAccountData: () => void;
};

const fallback = loadUserData(DEMO_USER.id);
const SprintlyContext = createContext<SprintlyContextValue | null>(null);

export function SprintlyProvider({ children }: { children: React.ReactNode }) {
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

  const value = useMemo<SprintlyContextValue>(() => ({
    ...data,
    userId,
    hydrated,
    importSessions: (sessions) => {
      const existing = new Set(data.sessions.map((item) => item.record.sessionId));
      // Signatures cannot be verified in the browser; only a production
      // server with trusted extension keys may mark records verified.
      const additions: StoredSession[] = sessions.filter((session) => !existing.has(session.sessionId)).map((record) => ({ record, source: "imported", importedAt: new Date().toISOString(), verified: false }));
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

  return <SprintlyContext.Provider value={value}>{children}</SprintlyContext.Provider>;
}

export function useSprintly() {
  const context = useContext(SprintlyContext);
  if (!context) throw new Error("useSprintly must be used inside SprintlyProvider");
  return context;
}
