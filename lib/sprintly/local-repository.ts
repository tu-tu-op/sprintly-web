import { serializeSprintlyExport, type SprintlySession } from "@/lib/sprintly/contract";
import {
  clearUserData,
  downloadTextFile,
  loadUserData,
  saveUserData,
  type UserData,
  type UserPreferences,
  type UserProfile,
} from "@/lib/sprintly/storage";
import type {
  ExtensionDevice,
  PairingCode,
  RepositoryLoad,
  SessionUploadResult,
  SprintlyRepository,
} from "@/lib/sprintly/repository";

export class LocalSprintlyRepository implements SprintlyRepository {
  readonly mode = "local" as const;

  async load(userId: string): Promise<RepositoryLoad> {
    return { data: loadUserData(userId), lastSyncAt: null };
  }

  async savePreferences(userId: string, patch: Partial<UserPreferences>) {
    const current = loadUserData(userId);
    saveUserData(userId, { ...current, preferences: { ...current.preferences, ...patch } }, current);
  }

  async saveProfile(userId: string, patch: Partial<UserProfile>) {
    const current = loadUserData(userId);
    saveUserData(userId, { ...current, profile: { ...current.profile, ...patch } }, current);
  }

  async uploadSessions(): Promise<SessionUploadResult> {
    return { accepted: [], duplicates: [], rejected: [{ reason: "local-only", message: "Connect Supabase before uploading sessions" }] };
  }

  async deleteSynchronizedHistory(userId: string) {
    const current = loadUserData(userId);
    const localOnly = current.sessions.filter((session) => !session.source || session.source !== "extension");
    saveUserData(userId, { ...current, sessions: localOnly }, current);
  }

  async exportSynchronizedData(userId: string) {
    const current = loadUserData(userId);
    return serializeSprintlyExport(current.sessions.filter((session) => session.source === "extension").map((session) => session.record));
  }

  async listDevices(): Promise<ExtensionDevice[]> {
    return [];
  }

  async createPairingCode(): Promise<PairingCode> {
    throw new Error("Connect Supabase before pairing an extension");
  }

  async revokeDevice(): Promise<void> {
    throw new Error("Connect Supabase before revoking an extension device");
  }

  async testConnection(): Promise<{ ok: boolean; lastSyncAt: string | null }> {
    return { ok: false, lastSyncAt: null };
  }
}

export function clearLocalAccount(userId: string) {
  clearUserData(userId);
}

export function downloadLocalExport(filename: string, content: string) {
  downloadTextFile(filename, content);
}

