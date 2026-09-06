import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION, sprintlySessionSchema } from "@/lib/sprintly/contract";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultPreferences, defaultProfile, type StoredSession } from "@/lib/sprintly/storage";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function mapPreferences(row: Record<string, unknown> | null, profileVisibility: unknown) {
  if (!row) return { ...defaultPreferences };
  return {
    ...defaultPreferences,
    profileVisibility: profileVisibility === "public" ? "public" as const : "private" as const,
    leaderboardOptIn: row.leaderboard_opt_in === true,
    leaderboardScope: row.leaderboard_scope === "country" || row.leaderboard_scope === "region"
      ? row.leaderboard_scope
      : "global" as const,
    syncPreference: row.sync_preference === "never" || row.sync_preference === "completed" || row.sync_preference === "leaderboard"
      ? row.sync_preference
      : "selected" as const,
    showTokenUsage: row.ai_usage_visibility === true,
    showTerminalActivity: row.terminal_activity_visibility === true,
    retentionDurationDays: typeof row.retention_duration_days === "number" ? row.retention_duration_days : 365,
    publicProfileConsent: row.public_profile_consent === true,
    geographicLeaderboardOptIn: row.leaderboard_scope === "country" || row.leaderboard_scope === "region",
    timeZone: typeof row.timezone === "string" && row.timezone ? row.timezone : defaultPreferences.timeZone,
  };
}

function mapProfile(row: Record<string, unknown> | null) {
  if (!row) return { ...defaultProfile };
  return {
    ...defaultProfile,
    displayName: typeof row.display_name === "string" ? row.display_name : defaultProfile.displayName,
    handle: typeof row.handle === "string" ? row.handle : defaultProfile.handle,
    city: typeof row.city_label === "string" ? row.city_label : "",
    region: typeof row.region === "string" ? row.region : "",
    country: typeof row.country === "string" ? row.country : "",
    bio: typeof row.bio === "string" ? row.bio : defaultProfile.bio,
    avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : undefined,
    avatarStyle: row.avatar_style === "mono" || row.avatar_style === "signal" ? row.avatar_style : "gradient",
  };
}

function mapSession(row: Record<string, unknown>): StoredSession | null {
  const payload = row.aggregate_payload && typeof row.aggregate_payload === "object"
    ? row.aggregate_payload as Record<string, unknown>
    : {};
  const candidate = {
    ...payload,
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    signature: typeof row.signature === "string" ? row.signature : undefined,
    publicKeyId: typeof row.public_key_id === "string" ? row.public_key_id : undefined,
  };
  const parsed = sprintlySessionSchema.safeParse(candidate);
  if (!parsed.success) return null;
  return {
    record: parsed.data,
    source: "extension",
    importedAt: typeof row.received_at === "string" ? row.received_at : new Date().toISOString(),
    receivedAt: typeof row.received_at === "string" ? row.received_at : undefined,
    remoteId: typeof row.id === "string" ? row.id : undefined,
    verified: row.verified === true,
    syncStatus: "synced",
  };
}

export async function GET() {
  const identity = await getWebsiteIdentity();
  if (!identity) return jsonError("Website authentication is required", 401);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const [profileResult, preferencesResult, sessionsResult] = await Promise.all([
    admin.from("profiles").select("display_name,handle,bio,avatar_url,avatar_style,country,region,city_label,profile_visibility").eq("user_id", identity.userId).maybeSingle(),
    admin.from("user_preferences").select("leaderboard_opt_in,leaderboard_scope,sync_preference,ai_usage_visibility,terminal_activity_visibility,retention_duration_days,public_profile_consent,timezone").eq("user_id", identity.userId).maybeSingle(),
    admin.from("sessions").select("id,aggregate_payload,signature,public_key_id,verified,received_at").eq("user_id", identity.userId).order("started_at", { ascending: false }),
  ]);

  if (profileResult.error || preferencesResult.error || sessionsResult.error) {
    return jsonError("Unable to load synchronized Sprintly data", 500);
  }

  const sessions = (sessionsResult.data ?? [])
    .map((row: Record<string, unknown>) => mapSession(row))
    .filter((session): session is StoredSession => Boolean(session));
  const lastSyncAt = sessions
    .map((session) => session.receivedAt ?? session.importedAt)
    .sort()
    .at(-1) ?? null;

  return Response.json(
    {
      ok: true,
      sessions,
      preferences: mapPreferences(
        preferencesResult.data as Record<string, unknown> | null,
        (profileResult.data as Record<string, unknown> | null)?.profile_visibility,
      ),
      profile: mapProfile(profileResult.data as Record<string, unknown> | null),
      lastSyncAt,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
