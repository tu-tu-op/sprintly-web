import { z } from "zod";

import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const revokeSchema = z.object({ deviceId: z.string().uuid() }).strict();

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
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

  const parsed = revokeSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Invalid device ID", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const { data, error } = await admin
    .from("extension_devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.deviceId)
    .eq("user_id", identity.userId)
    .is("revoked_at", null)
    .select("id,revoked_at")
    .maybeSingle();

  if (error) return jsonError("Unable to revoke device", 500);
  if (!data) return jsonError("Device was not found or is already revoked", 404);

  return Response.json(
    { ok: true, deviceId: data.id, revokedAt: data.revoked_at },
    { headers: { "cache-control": "no-store" } },
  );
}

