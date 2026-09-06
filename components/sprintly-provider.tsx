"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getAuthSession } from "@/lib/sprintly/auth";
import { SPRINTLY_CONTRACT, type SprintlySession } from "@/lib/sprintly/contract";
import { DEMO_USER } from "@/lib/sprintly/demo-data";
import { hasSupabasePublicConfig } from "@/lib/sprintly/config";
import { LocalSprintlyRepository } from "@/lib/sprintly/local-repository";
import {
  RemoteSprintlyRepository,
} from "@/lib/sprintly/remote-repository";
import type {
  ExtensionDevice,
  PairingCode,
  RepositoryMode,
  SprintlyRepository,
} from "@/lib/sprintly/repository";
import {
  defaultPreferences,
  defaultProfile,
  loadUserData,
  saveUserData,
  type ShareSnapshot,
  type StoredSession,
  type UserData,
  type UserPreferences,
  type UserProfile,
} from "@/lib/sprintly/storage";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";

type SprintlyContextValue = UserData & {
  userId: string;
  hydrated: boolean;
  repositoryMode: RepositoryMode;
  syncLoading: boolean;
  syncError: string | null;
  lastSyncAt: string | null;
  importSessions: (sessions: SprintlySession[]) => number;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  createShare: (snapshot: ShareSnapshot) => void;
  removeShare: (id: string) => void;
  deleteCloudHistory: () => void;
  deleteAccountData: () => void;
  refresh: () => Promise<void>;
  listExtensionDevices: () => Promise<ExtensionDevice[]>;
  createPairingCode: () => Promise<PairingCode>;
  revokeExtensionDevice: (deviceId: string) => Promise<void>;
  testConnection: () => Promise<{ ok: boolean; lastSyncAt: string | null }>;
  exportSynchronizedData: () => Promise<string>;
};

const createEmptyUserData = (): UserData => ({
  sessions: [],
  preferences: { ...defaultPreferences },
  profile: { ...defaultProfile },
  shares: [],
});

const SprintlyContext = createContext<SprintlyContextValue | null>(null);

export function SprintlyProvider({ children }: { children: React.ReactNode }) {
  const remoteEnabled = hasSupabasePublicConfig();
  const repository = useMemo<SprintlyRepository>(
    () => remoteEnabled ? new RemoteSprintlyRepository() : new LocalSprintlyRepository(),
    [remoteEnabled],
  );
  const [userId, setUserId] = useState<string>(DEMO_USER.id);
  const [data, setData] = useState<UserData>(createEmptyUserData);
  const [hydrated, setHydrated] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const persisted = useRef<{ userId: string; data: Partial<UserData> } | null>(null);

  useIsoLayoutEffect(() => {
    let cancelled = false;

    void (async () => {
      const auth = getAuthSession();
      let nextUserId = auth?.userId ?? DEMO_USER.id;
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user?.id) nextUserId = authData.user.id;
      }

      if (cancelled) return;
      setUserId(nextUserId);
      setData(loadUserData(nextUserId));
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    if (!hydrated) return;
    if (repository.mode === "local") {
      setData(loadUserData(userId));
      return;
    }

    setSyncLoading(true);
    setSyncError(null);
    try {
      const result = await repository.load(userId);
      setData(result.data);
      setLastSyncAt(result.lastSyncAt);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to refresh synchronized data";
      setSyncError(message);
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    void refresh();
    // The repository and user are intentionally the only refresh boundaries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, userId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const previous = persisted.current?.userId === userId ? persisted.current.data : undefined;
    persisted.current = { userId, data: saveUserData(userId, data, previous) };
  }, [data, hydrated, userId]);

  const value = useMemo<SprintlyContextValue>(() => ({
    ...data,
    userId,
    hydrated,
    repositoryMode: repository.mode,
    syncLoading,
    syncError,
    lastSyncAt,
    importSessions: (sessions) => {
      const existing = new Set(data.sessions.map((item) => item.record.sessionId));
      const additions: StoredSession[] = sessions
        .filter((session) => !existing.has(session.sessionId))
        .map((record) => ({
          record,
          source: "imported",
          importedAt: new Date().toISOString(),
          verified: false,
          syncStatus: "local",
        }));
      const added = additions.length;
      if (added) setData((current) => ({ ...current, sessions: [...current.sessions, ...additions] }));
      if (added) toast.success(`${added} session${added === 1 ? "" : "s"} imported`, {
        description: "Imported records stay local until you explicitly migrate them.",
      });
      return added;
    },
    updatePreferences: (patch) => {
      setData((current) => ({ ...current, preferences: { ...current.preferences, ...patch } }));
      if (repository.mode === "remote") {
        void repository.savePreferences(userId, patch).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unable to save preferences";
          setSyncError(message);
          toast.error(message);
        });
      }
    },
    updateProfile: (patch) => {
      setData((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
      if (repository.mode === "remote") {
        void repository.saveProfile(userId, patch).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unable to save profile";
          setSyncError(message);
          toast.error(message);
        });
      }
    },
    createShare: (snapshot) => setData((current) => ({ ...current, shares: [snapshot, ...current.shares.filter((item) => item.id !== snapshot.id)] })),
    removeShare: (id) => setData((current) => ({ ...current, shares: current.shares.filter((item) => item.id !== id) })),
    deleteCloudHistory: () => {
      setData((current) => ({
        ...current,
        sessions: repository.mode === "remote"
          ? current.sessions.filter((session) => session.source !== "extension")
          : [],
      }));
      if (repository.mode === "remote") {
        void repository.deleteSynchronizedHistory(userId).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unable to delete synchronized history";
          setSyncError(message);
          toast.error(message);
        });
      }
    },
    deleteAccountData: () => {
      setData(createEmptyUserData());
      if (repository.mode === "remote") void repository.deleteSynchronizedHistory(userId).catch(() => undefined);
    },
    refresh,
    listExtensionDevices: () => repository.listDevices(userId),
    createPairingCode: () => repository.createPairingCode(userId),
    revokeExtensionDevice: (deviceId) => repository.revokeDevice(userId, deviceId),
    testConnection: () => repository.testConnection(userId),
    exportSynchronizedData: () => repository.exportSynchronizedData(userId),
  }), [data, hydrated, lastSyncAt, repository, syncError, syncLoading, userId]);

  if (!hydrated) return null;
  return <SprintlyContext.Provider value={value}>{children}</SprintlyContext.Provider>;
}

export function useSprintly() {
  const context = useContext(SprintlyContext);
  if (!context) throw new Error("useSprintly must be used inside SprintlyProvider");
  return context;
}

