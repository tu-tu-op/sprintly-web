import { serializeSprintlyExport, type SprintlySession } from "@/lib/sprintly/contract";
import { loadUserData, type StoredSession, type UserData, type UserPreferences, type UserProfile } from "@/lib/sprintly/storage";
import type {
  ExtensionDevice,
  PairingCode,
  RepositoryLoad,
  SessionUploadResult,
  SprintlyRepository,
} from "@/lib/sprintly/repository";

type RemoteDataResponse = {
  ok: true;
  sessions: StoredSession[];
  preferences: Partial<UserPreferences>;
  profile: Partial<UserProfile>;
  lastSyncAt: string | null;
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, cache: "no-store" });
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error || `Request failed with status ${response.status}`);
  return payload as T;
}

export class RemoteSprintlyRepository implements SprintlyRepository {
  readonly mode = "remote" as const;

  async load(userId: string): Promise<RepositoryLoad> {
    const local = loadUserData(userId);
    const remote = await requestJson<RemoteDataResponse>("/api/sprintly/data");
    const localFallback = local.sessions.filter((session) => session.source !== "extension");
    return {
      data: {
        ...local,
        sessions: [...remote.sessions, ...localFallback],
        preferences: { ...local.preferences, ...remote.preferences },
        profile: { ...local.profile, ...remote.profile },
      },
      lastSyncAt: remote.lastSyncAt,
    };
  }

  async savePreferences(_userId: string, patch: Partial<UserPreferences>) {
    await requestJson("/api/sprintly/preferences", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
  }

  async saveProfile(_userId: string, patch: Partial<UserProfile>) {
    await requestJson("/api/sprintly/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
  }

  async uploadSessions(_userId: string, sessions: SprintlySession[]) {
    const response = await requestJson<{
      accepted: string[];
      duplicates: string[];
      rejected: Array<{ sessionId?: string; reason: string; message: string }>;
    }>("/api/sprintly/sessions/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contract: "devstrava.session.v1", schemaVersion: 1, sessions }),
    });
    return response;
  }

  async deleteSynchronizedHistory() {
    await requestJson("/api/sprintly/sessions", { method: "DELETE" });
  }

  async exportSynchronizedData() {
    const response = await fetch("/api/sprintly/sessions/export", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to export synchronized data");
    const text = await response.text();
    return text || serializeSprintlyExport([]);
  }

  async listDevices() {
    const response = await requestJson<{ devices: ExtensionDevice[] }>("/api/extension/devices");
    return response.devices;
  }

  async createPairingCode() {
    return requestJson<PairingCode>("/api/extension/pairing", { method: "POST" });
  }

  async revokeDevice(_userId: string, deviceId: string) {
    await requestJson("/api/extension/devices/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
  }

  async testConnection() {
    const response = await requestJson<{ lastSyncAt: string | null }>("/api/extension/connection");
    return { ok: true, lastSyncAt: response.lastSyncAt };
  }
}

