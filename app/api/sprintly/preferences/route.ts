import { z } from "zod";

import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const preferencesPatchSchema = z.object({
  profileVisibility: z.enum(["private", "public"]),
  leaderboardOptIn: z.boolean(),
  leaderboardScope: z.enum(["global", "country", "region"]),
  syncPreference: z.enum(["never", "selected", "completed", "leaderboard"]),
  showTokenUsage: z.boolean(),
  showTerminalActivity: z.boolean(),
  retentionDurationDays: z.number().int().min(1).max(3650),
  publicProfileConsent: z.boolean(),
  geographicLeaderboardOptIn: z.boolean(),
  timeZone: z.string().trim().min(1).max(100),
}).partial().strict();

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function uiPreferences(row: Record<string, unknown> | null) {
  return {
    profileVisibility: row?.profile_visibility === "public" ? "public" as const : "private" as const,
    leaderboardOptIn: row?.leaderboard_opt_in === true,
    leaderboardScope: row?.leaderboard_scope === "country" || row?.leaderboard_scope === "region" ? row.leaderboard_scope : "global" as const,
    syncPreference: row?.sync_preference === "never" || row?.sync_preference === "completed" || row?.sync_preference === "leaderboard" ? row.sync_preference : "selected" as const,
    showTokenUsage: row?.ai_usage_visibility === true,
    showTerminalActivity: row?.terminal_activity_visibility === true,
    retentionDurationDays: typeof row?.retention_duration_days === "number" ? row.retention_duration_days : 365,
    publicProfileConsent: row?.public_profile_consent === true,
    geographicLeaderboardOptIn: row?.leaderboard_scope === "country" || row?.leaderboard_scope === "region",
    timeZone: typeof row?.timezone === "string" && row.timezone ? row.timezone : "UTC",
  };
}

function consentChanges(previous: ReturnType<typeof uiPreferences>, next: ReturnType<typeof uiPreferences>) {
  return [
    ["session_sync", previous.syncPreference !== "never", next.syncPreference !== "never"],
    ["ai_usage_statistics", previous.showTokenUsage, next.showTokenUsage],
    ["terminal_activity_statistics", previous.showTerminalActivity, next.showTerminalActivity],
    ["leaderboard_participation", previous.leaderboardOptIn, next.leaderboardOptIn],
    ["public_profile", previous.publicProfileConsent, next.publicProfileConsent],
    ["geographic_leaderboard", previous.geographicLeaderboardOptIn, next.geographicLeaderboardOptIn],
  ] as const;
}

export async function POST(request: Request) {
  const identity = await getWebsiteIdentity();
  if (!identity) return jsonError("Website authentication is required", 401);

  let payload: unknown;
  try {
    payload = JSON.parse(await request.text()) as unknown;
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }
  const parsed = preferencesPatchSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Invalid preferences", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const currentResult = await admin
    .from("user_preferences")
    .select("profile_visibility,leaderboard_opt_in,leaderboard_scope,sync_preference,ai_usage_visibility,terminal_activity_visibility,retention_duration_days,public_profile_consent,timezone")
    .eq("user_id", identity.userId)
    .maybeSingle();
  if (currentResult.error) return jsonError("Unable to read preferences", 500);

  const previous = uiPreferences(currentResult.data as Record<string, unknown> | null);
  const next = { ...previous, ...parsed.data };
  if (!next.publicProfileConsent) next.profileVisibility = "private";
  if (!next.geographicLeaderboardOptIn) next.leaderboardScope = "global";
  if (next.leaderboardScope !== "global" && !next.geographicLeaderboardOptIn) {
    return jsonError("Geographic leaderboard consent is required for country or region scope", 400);
  }

  const databasePreferences = {
    user_id: identity.userId,
    profile_visibility: next.profileVisibility,
    leaderboard_opt_in: next.leaderboardOptIn,
    leaderboard_scope: next.leaderboardScope,
    sync_preference: next.syncPreference,
    ai_usage_visibility: next.showTokenUsage,
    terminal_activity_visibility: next.showTerminalActivity,
    retention_duration_days: next.retentionDurationDays,
    public_profile_consent: next.publicProfileConsent,
    timezone: next.timeZone,
  };

  const { error: saveError } = await admin
    .from("user_preferences")
    .upsert(databasePreferences, { onConflict: "user_id" });
  if (saveError) return jsonError("Unable to save preferences", 500);

  if (previous.leaderboardOptIn && !next.leaderboardOptIn) {
    const { error } = await admin.rpc("revoke_user_leaderboard_entries", { target_user_id: identity.userId });
    if (error) return jsonError("Unable to revoke leaderboard entries", 500);
  }

  const changedConsents = consentChanges(previous, next)
    .filter(([, before, after]) => before !== after)
    .map(([consentType, , after]) => ({
      user_id: identity.userId,
      consent_type: consentType,
      action: after ? "granted" : "revoked",
    }));
  if (changedConsents.length) {
    const { error } = await admin.from("consent_events").insert(changedConsents);
    if (error) return jsonError("Unable to record consent changes", 500);
  }

  return Response.json(
    { ok: true, preferences: next },
    { headers: { "cache-control": "no-store" } },
  );
}

