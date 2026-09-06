import { z } from "zod";

import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { getDefaultRetentionDays } from "@/lib/sprintly/config";
import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION } from "@/lib/sprintly/contract";
import { MAX_EXTENSION_REQUEST_BYTES, validateExtensionUpload } from "@/lib/sprintly/extension";
import { computeServerSessionMetrics, zeroAi, zeroTerminal } from "@/lib/sprintly/server-scoring";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
const uuidSchema = z.string().uuid();

function errorResponse(message: string, status: number) { return Response.json({ ok: false, error: message }, { status, headers: { "cache-control": "no-store" } }); }

function payloadForStorage(session: Parameters<typeof computeServerSessionMetrics>[0], metrics: ReturnType<typeof computeServerSessionMetrics>, showAi: boolean, showTerminal: boolean) {
  return { contract: SPRINTLY_CONTRACT, schemaVersion: SPRINTLY_SCHEMA_VERSION, sessionId: session.sessionId, startedAt: session.startedAt, endedAt: session.endedAt, activeDurationSeconds: session.activeDurationSeconds, coding: session.coding, activity: session.activity, terminal: showTerminal ? session.terminal : zeroTerminal(), ai: showAi ? session.ai : zeroAi(), reliability: session.reliability, scores: { focus: metrics.focusScore, testingDiscipline: metrics.testingDisciplineScore, recovery: metrics.recoveryScore, consistency: metrics.consistencyScore, aiBalance: metrics.aiBalanceScore, devScore: metrics.devScore }, archetype: session.archetype };
}

export async function POST(request: Request) {
  const identity = await getWebsiteIdentity();
  if (!identity) return errorResponse("Website authentication is required", 401);
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_EXTENSION_REQUEST_BYTES) return errorResponse("Request body is too large", 413);
  let payload: unknown;
  try { payload = JSON.parse(body) as unknown; } catch { return errorResponse("Request body must be valid JSON", 400); }
  const validation = validateExtensionUpload(payload);
  if (!validation.ok && !validation.sessions.length) return Response.json({ ok: false, contract: SPRINTLY_CONTRACT, schemaVersion: SPRINTLY_SCHEMA_VERSION, accepted: [], duplicates: [], rejected: validation.rejected }, { status: 400 });
  if (!uuidSchema.safeParse(identity.userId).success) return errorResponse("Website user is not configured with a valid Supabase user ID", 503);
  const admin = createSupabaseAdminClient();
  if (!admin) return errorResponse("Remote synchronization is not configured", 503);

  const { data: preferences, error: preferencesError } = await admin.from("user_preferences").select("sync_preference,retention_duration_days,ai_usage_visibility,terminal_activity_visibility").eq("user_id", identity.userId).maybeSingle();
  if (preferencesError) return errorResponse("Unable to read synchronization preferences", 500);
  const rejected: Array<{ index: number; sessionId?: string; reason: string; message: string }> = [...validation.rejected];
  if ((preferences?.sync_preference ?? "never") === "never") {
    validation.sessions.forEach(({ index, record }) => rejected.push({ index, sessionId: record.sessionId, reason: "sync-disabled", message: "Enable synchronization in Settings before migrating local records" }));
    return Response.json({ ok: false, contract: SPRINTLY_CONTRACT, schemaVersion: SPRINTLY_SCHEMA_VERSION, accepted: [], duplicates: [], rejected }, { headers: { "cache-control": "no-store" } });
  }
  const ids = validation.sessions.map(({ record }) => record.sessionId);
  const { data: existing, error: existingError } = await admin.from("sessions").select("session_id").eq("user_id", identity.userId).in("session_id", ids);
  if (existingError) return errorResponse("Unable to check existing sessions", 500);
  const existingIds = new Set((existing ?? []).map((row: { session_id: string }) => row.session_id));
  const accepted: string[] = [];
  const duplicates: string[] = [];
  const retentionDays = typeof preferences?.retention_duration_days === "number" ? preferences.retention_duration_days : getDefaultRetentionDays();
  const retentionExpiresAt = new Date(Date.now() + retentionDays * 86_400_000).toISOString();
  for (const { index, record } of validation.sessions) {
    if (existingIds.has(record.sessionId)) { duplicates.push(record.sessionId); continue; }
    const metrics = computeServerSessionMetrics(record);
    const { error } = await admin.from("sessions").insert({ user_id: identity.userId, session_id: record.sessionId, device_id: null, contract: SPRINTLY_CONTRACT, schema_version: SPRINTLY_SCHEMA_VERSION, started_at: new Date(record.startedAt).toISOString(), ended_at: new Date(record.endedAt).toISOString(), active_duration_seconds: record.activeDurationSeconds, focus_score: metrics.focusScore, dev_score: metrics.devScore, consistency_score: metrics.consistencyScore, testing_discipline_score: metrics.testingDisciplineScore, recovery_score: metrics.recoveryScore, ai_balance_score: metrics.aiBalanceScore, aggregate_payload: payloadForStorage(record, metrics, preferences?.ai_usage_visibility === true, preferences?.terminal_activity_visibility === true), signature: record.signature ?? null, public_key_id: record.publicKeyId ?? null, verified: false, received_at: new Date().toISOString(), retention_expires_at: retentionExpiresAt });
    if (!error) { accepted.push(record.sessionId); existingIds.add(record.sessionId); } else if (error.code === "23505") duplicates.push(record.sessionId); else rejected.push({ index, sessionId: record.sessionId, reason: "storage-error", message: "The session could not be stored" });
  }
  return Response.json({ ok: rejected.length === 0, contract: SPRINTLY_CONTRACT, schemaVersion: SPRINTLY_SCHEMA_VERSION, accepted, duplicates, rejected }, { headers: { "cache-control": "no-store" } });
}
