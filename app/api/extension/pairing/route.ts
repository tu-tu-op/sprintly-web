import { randomBytes } from "node:crypto";

import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { hashExtensionToken } from "@/lib/sprintly/extension-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function pairingTtlSeconds() {
  const configured = Number(process.env.SPRINTLY_EXTENSION_PAIRING_TTL_SECONDS ?? "600");
  return Number.isInteger(configured) && configured >= 60 && configured <= 900 ? configured : 600;
}

function newPairingCode() {
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function POST() {
  const identity = await getWebsiteIdentity();
  if (!identity) return jsonError("Website authentication is required", 401);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const expiresAt = new Date(Date.now() + pairingTtlSeconds() * 1000).toISOString();
  const code = newPairingCode();
  const codeHash = hashExtensionToken(code);

  await admin
    .from("extension_pairing_codes")
    .delete()
    .eq("user_id", identity.userId)
    .lt("expires_at", new Date().toISOString());

  const { error } = await admin.from("extension_pairing_codes").insert({
    user_id: identity.userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (error) return jsonError("Unable to create a pairing code", 500);

  return Response.json(
    {
      ok: true,
      code,
      expiresAt,
      expiresInSeconds: pairingTtlSeconds(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}

