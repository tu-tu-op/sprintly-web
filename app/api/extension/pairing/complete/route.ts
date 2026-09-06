import { randomBytes } from "node:crypto";

import { z } from "zod";

import { hashExtensionToken } from "@/lib/sprintly/extension-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const pairingRequestSchema = z.object({
  code: z.string().trim().regex(/^[A-Fa-f0-9]{12}$/),
  deviceId: z.string().trim().min(8).max(160),
  deviceName: z.string().trim().min(1).max(120),
  deviceType: z.enum(["vscode", "desktop", "other"]).default("vscode"),
  publicKeyId: z.string().trim().min(1).max(128).optional(),
}).strict();

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 32_000) return jsonError("Pairing request is too large", 413);

  let payload: unknown;
  try {
    payload = JSON.parse(await request.text()) as unknown;
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }

  const parsed = pairingRequestSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Invalid pairing request", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const codeHash = hashExtensionToken(parsed.data.code.toUpperCase());
  const { data: pairing, error: pairingError } = await admin
    .from("extension_pairing_codes")
    .select("id,user_id,expires_at,consumed_at")
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pairingError || !pairing) return jsonError("Pairing code is invalid or expired", 400);

  const consumedAt = new Date().toISOString();
  const { data: consumed, error: consumeError } = await admin
    .from("extension_pairing_codes")
    .update({ consumed_at: consumedAt })
    .eq("id", pairing.id)
    .is("consumed_at", null)
    .gt("expires_at", consumedAt)
    .select("id,user_id")
    .maybeSingle();

  if (consumeError || !consumed) return jsonError("Pairing code has already been consumed", 409);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashExtensionToken(token);
  const { data: device, error: deviceError } = await admin
    .from("extension_devices")
    .insert({
      user_id: consumed.user_id,
      device_id: parsed.data.deviceId,
      device_name: parsed.data.deviceName,
      device_type: parsed.data.deviceType,
      token_hash: tokenHash,
      public_key_id: parsed.data.publicKeyId ?? null,
    })
    .select("id,device_id,device_name,device_type,created_at")
    .single();

  if (deviceError) {
    if (deviceError.code === "23505") return jsonError("This device is already paired", 409);
    return jsonError("Unable to save paired device", 500);
  }

  return Response.json(
    {
      ok: true,
      token,
      device,
      tokenWarning: "Store this token securely. It will not be returned again.",
    },
    { headers: { "cache-control": "no-store" } },
  );
}

