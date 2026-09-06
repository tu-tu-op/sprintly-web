import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Scope = "global" | "country" | "region";
const DAY_MS = 86_400_000;

function jsonError(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status, headers: { "cache-control": "no-store" } });
}

function weeklyPeriod(now = new Date()) {
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const offset = (current.getUTCDay() + 6) % 7;
  const startsAt = new Date(current.getTime() - offset * DAY_MS);
  const endsAt = new Date(startsAt.getTime() + 7 * DAY_MS);
  const periodKey = startsAt.toISOString().slice(0, 10);
  return { periodKey, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), timezone: "UTC" };
}

function scopeFrom(value: string | null): Scope | null {
  return value === "global" || value === "country" || value === "region" ? value : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = scopeFrom(url.searchParams.get("scope"));
  if (!scope) return jsonError("Scope must be global, country, or region", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  let scopeKey = scope === "global" ? "global" : (url.searchParams.get("scopeKey")?.trim() ?? "");
  if (scope !== "global" && (!scopeKey || scopeKey.length > 120)) {
    const identity = await getWebsiteIdentity();
    if (identity) {
      const { data } = await admin.from("profiles").select("country,region").eq("user_id", identity.userId).maybeSingle();
      scopeKey = scope === "country" ? String(data?.country ?? "") : String(data?.region ?? "");
    }
  }
  if (scope !== "global" && !scopeKey) return jsonError("A country or region scope key is required", 400);

  const period = weeklyPeriod();
  const { data: periodRow, error: periodError } = await admin
    .from("leaderboard_periods")
    .upsert({ period_type: "weekly", period_key: period.periodKey, starts_at: period.startsAt, ends_at: period.endsAt, timezone: period.timezone }, { onConflict: "period_type,period_key" })
    .select("id,period_key,starts_at,ends_at,timezone")
    .single();
  if (periodError || !periodRow) return jsonError("Unable to create leaderboard period", 500);

  const nowIso = new Date().toISOString();
  const [sessionsResult, preferencesResult, profilesResult] = await Promise.all([
    admin.from("sessions").select("user_id,active_duration_seconds,dev_score,focus_score,consistency_score,retention_expires_at").gte("started_at", period.startsAt).lt("started_at", period.endsAt).gt("retention_expires_at", nowIso),
    admin.from("user_preferences").select("user_id,leaderboard_opt_in,leaderboard_scope").eq("leaderboard_opt_in", true),
    admin.from("profiles").select("user_id,country,region"),
  ]);
  if (sessionsResult.error || preferencesResult.error || profilesResult.error) return jsonError("Unable to calculate leaderboard aggregates", 500);

  const preferences = new Map((preferencesResult.data ?? []).map((row: { user_id: string; leaderboard_scope: Scope }) => [row.user_id, row]));
  const profiles = new Map((profilesResult.data ?? []).map((row: { user_id: string; country: string | null; region: string | null }) => [row.user_id, row]));
  const aggregates = new Map<string, { seconds: number; scoreWeight: number; scoreTotal: number; focusTotal: number; consistencyTotal: number; expiresAt: string }>();
  for (const row of sessionsResult.data ?? []) {
    if (!preferences.has(row.user_id)) continue;
    const duration = Math.max(1, Number(row.active_duration_seconds ?? 0));
    const current = aggregates.get(row.user_id) ?? { seconds: 0, scoreWeight: 0, scoreTotal: 0, focusTotal: 0, consistencyTotal: 0, expiresAt: row.retention_expires_at };
    current.seconds += duration;
    current.scoreWeight += duration;
    current.scoreTotal += Number(row.dev_score ?? 0) * duration;
    current.focusTotal += Number(row.focus_score ?? 0) * duration;
    current.consistencyTotal += Number(row.consistency_score ?? 0) * duration;
    current.expiresAt = current.expiresAt < row.retention_expires_at ? current.expiresAt : row.retention_expires_at;
    aggregates.set(row.user_id, current);
  }

  const entries = [...aggregates.entries()].flatMap(([userId, aggregate]) => {
    const preference = preferences.get(userId);
    const profile = profiles.get(userId);
    if (!preference || !profile || !aggregate.scoreWeight) return [];
    const scopes: Array<{ scope_type: Scope; scope_key: string }> = [{ scope_type: "global", scope_key: "global" }];
    if (preference.leaderboard_scope === "country" && profile.country) scopes.push({ scope_type: "country", scope_key: profile.country });
    if (preference.leaderboard_scope === "region" && profile.region) scopes.push({ scope_type: "region", scope_key: profile.region });
    return scopes.map((item) => ({
      period_id: periodRow.id,
      user_id: userId,
      scope_type: item.scope_type,
      scope_key: item.scope_key,
      score: Math.round(aggregate.scoreTotal / aggregate.scoreWeight),
      focus_time_seconds: aggregate.seconds,
      session_count: (sessionsResult.data ?? []).filter((row: { user_id: string }) => row.user_id === userId).length,
      consistency_score: Number((aggregate.consistencyTotal / aggregate.scoreWeight).toFixed(3)),
      retention_expires_at: aggregate.expiresAt,
      revoked_at: null,
    }));
  });
  if (entries.length) {
    const { error } = await admin.from("leaderboard_entries").upsert(entries, { onConflict: "period_id,user_id,scope_type,scope_key" });
    if (error) return jsonError("Unable to store leaderboard aggregates", 500);
  }

  const { data: publicEntries, error: publicError } = await admin.rpc("get_public_leaderboard", {
    target_period_id: periodRow.id,
    target_scope_type: scope,
    target_scope_key: scopeKey,
  });
  if (publicError) return jsonError("Unable to load leaderboard", 500);

  return Response.json(
    { ok: true, period: periodRow, scope, scopeKey, entries: publicEntries ?? [] },
    { headers: { "cache-control": "no-store" } },
  );
}
