import type { SprintlySession } from "@/lib/sprintly/contract";
import type {
  StoredSession,
  UserData,
  UserPreferences,
  UserProfile,
} from "@/lib/sprintly/storage";

export type RepositoryMode = "local" | "remote";

export type RepositoryLoad = {
  data: UserData;
  lastSyncAt: string | null;
};

export type SessionUploadResult = {
  accepted: string[];
  duplicates: string[];
  rejected: Array<{ sessionId?: string; reason: string; message: string }>;
};

export type ExtensionDevice = {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  public_key_id: string | null;
  created_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
};

export type PairingCode = {
  code: string;
  expiresAt: string;
  expiresInSeconds: number;
};

export interface SprintlyRepository {
  readonly mode: RepositoryMode;
  load(userId: string): Promise<RepositoryLoad>;
  savePreferences(userId: string, patch: Partial<UserPreferences>): Promise<void>;
  saveProfile(userId: string, patch: Partial<UserProfile>): Promise<void>;
  uploadSessions(userId: string, sessions: SprintlySession[]): Promise<SessionUploadResult>;
  deleteSynchronizedHistory(userId: string): Promise<void>;
  exportSynchronizedData(userId: string): Promise<string>;
  listDevices(userId: string): Promise<ExtensionDevice[]>;
  createPairingCode(userId: string): Promise<PairingCode>;
  revokeDevice(userId: string, deviceId: string): Promise<void>;
  testConnection(userId: string): Promise<{ ok: boolean; lastSyncAt: string | null }>;
}

export function isRemoteSession(session: StoredSession) {
  return session.source === "extension" || session.syncStatus === "synced";
}

