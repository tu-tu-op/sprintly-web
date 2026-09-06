import { z } from "zod";

import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION } from "@/lib/sprintly/contract";
import { getDefaultRetentionDays } from "@/lib/sprintly/config";
import {
  MAX_EXTENSION_REQUEST_BYTES,
  validateExtensionUpload,
} from "@/lib/sprintly/extension";
import {
  authenticateExtensionRequest,
  touchExtensionDevice,
} from "@/lib/sprintly/extension-auth";
import { computeServerSessionMetrics, zeroAi, zeroTerminal } from "@/lib/sprintly/server-scoring";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const uuidSchema = z.string().uuid();

type RejectedResult = {
  index: number;
  sessionId?: string;
  reason: string;
  message: string;
};

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function requestBytes(text: string) {
  return new TextEncoder().encode(text).byteLength;
}

function parseRetentionDays(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 3650
    ? value
    : getDefaultRetentionDays();
}

function sanitizedAggregatePayload(
  session: Parameters<typeof computeServerSessionMetrics>[0],
  metrics: ReturnType<typeof computeServerSessionMetrics>,
  options: { showAi: boolean; showTerminal: boolean },
) {
  return {
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    activeDurationSeconds: session.activeDurationSeconds,
    coding: session.coding,
    activity: session.activity,
    terminal: options.showTerminal ? session.terminal : zeroTerminal(),
    ai: options.showAi ? session.ai : zeroAi(),
    reliability: session.reliability,
    scores: {
      focus: metrics.focusScore,
      testingDiscipline: metrics.testingDisciplineScore,
      recovery: metrics.recoveryScore,
      consistency: metrics.consistencyScore,
      aiBalance: metrics.aiBalanceScore,
      devScore: metrics.devScore,
    },
    archetype: session.archetype,
  };
}

export async function POST(request: Request) {
  const principal = await authenticateExtensionRequest(request);
  if (!principal) return jsonError("Missing or invalid extension token", 401);

  const bodyText = await request.text();
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_EXTENSION_REQUEST_BYTES) {
    return jsonError("Request body is too large", 413);
  }
  if (requestBytes(bodyText) > MAX_EXTENSION_REQUEST_BYTES) {
    return jsonError("Request body is too large", 413);
  }

  await touchExtensionDevice(principal);

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText) as unknown;
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }

  const validation = validateExtensionUpload(payload);
  if (!validation.ok && validation.sessions.length === 0) {
    return Response.json(
      {
        ok: false,
        contract: SPRINTLY_CONTRACT,
        schemaVersion: SPRINTLY_SCHEMA_VERSION,
        accepted: [],
        duplicates: [],
        rejected: validation.rejected,
      },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const userIdResult = uuidSchema.safeParse(principal.userId);
  if (!userIdResult.success) {
    return jsonError("Extension user is not configured with a valid Supabase user ID", 503);
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const { data: preferences, error: preferencesError } = await admin
    .from("user_preferences")
    .select("sync_preference,retention_duration_days,ai_usage_visibility,terminal_activity_visibility")
    .eq("user_id", userIdResult.data)
    .maybeSingle();

  if (preferencesError) return jsonError("Unable to read synchronization preferences", 500);

  const syncPreference = preferences?.sync_preference ?? "never";
  const rejected: RejectedResult[] = [...validation.rejected];
  if (syncPreference === "never") {
    for (const item of validation.sessions) {
      rejected.push({
        index: item.index,
        sessionId: item.record.sessionId,
        reason: "sync-disabled",
        message: "Session synchronization is disabled in website settings",
      });
    }
    return Response.json(
      {
        ok: false,
        contract: SPRINTLY_CONTRACT,
        schemaVersion: SPRINTLY_SCHEMA_VERSION,
        accepted: [],
        duplicates: [],
        rejected,
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  const ids = validation.sessions.map(({ record }) => record.sessionId);
  const { data: existingRows, error: existingError } = await admin
    .from("sessions")
    .select("session_id")
    .eq("user_id", userIdResult.data)
    .in("session_id", ids);
  if (existingError) return jsonError("Unable to check existing sessions", 500);

  const existingIds = new Set((existingRows ?? []).map((row: { session_id: string }) => row.session_id));
  const duplicates: string[] = [];
  const accepted: string[] = [];
  const retentionDays = parseRetentionDays(preferences?.retention_duration_days);
  const retentionExpiresAt = new Date(Date.now() + retentionDays * 86_400_000).toISOString();

  for (const { index, record } of validation.sessions) {
    if (existingIds.has(record.sessionId)) {
      duplicates.push(record.sessionId);
      continue;
    }

    const metrics = computeServerSessionMetrics(record);
    const { error: insertError } = await admin.from("sessions").insert({
      user_id: userIdResult.data,
      session_id: record.sessionId,
      device_id: principal.deviceRecordId,
      contract: SPRINTLY_CONTRACT,
      schema_version: SPRINTLY_SCHEMA_VERSION,
      started_at: new Date(record.startedAt).toISOString(),
      ended_at: new Date(record.endedAt).toISOString(),
      active_duration_seconds: record.activeDurationSeconds,
      focus_score: metrics.focusScore,
      dev_score: metrics.devScore,
      consistency_score: metrics.consistencyScore,
      testing_discipline_score: metrics.testingDisciplineScore,
      recovery_score: metrics.recoveryScore,
      ai_balance_score: metrics.aiBalanceScore,
      aggregate_payload: sanitizedAggregatePayload(record, metrics, {
        showAi: preferences?.ai_usage_visibility === true,
        showTerminal: preferences?.terminal_activity_visibility === true,
      }),
      signature: record.signature ?? null,
      public_key_id: record.publicKeyId ?? principal.publicKeyId,
      verified: false,
      received_at: new Date().toISOString(),
      retention_expires_at: retentionExpiresAt,
    });

    if (!insertError) {
      accepted.push(record.sessionId);
      existingIds.add(record.sessionId);
      continue;
    }

    if (insertError.code === "23505") {
      duplicates.push(record.sessionId);
      continue;
    }

    rejected.push({
      index,
      sessionId: record.sessionId,
      reason: "storage-error",
      message: "The session could not be stored",
    });
  }

  return Response.json(
    {
      ok: rejected.length === 0,
      contract: SPRINTLY_CONTRACT,
      schemaVersion: SPRINTLY_SCHEMA_VERSION,
      accepted,
      duplicates,
      rejected,
    },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
