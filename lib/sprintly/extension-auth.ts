import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ExtensionPrincipal = {
  userId: string;
  authMode: "development" | "paired-device";
  deviceRecordId: string | null;
  deviceId: string | null;
  publicKeyId: string | null;
};

export function hashExtensionToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function secureTokenEquals(left: string, right: string) {
  const leftBytes = Buffer.from(left, "utf8");
  const rightBytes = Buffer.from(right, "utf8");
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  const token = match?.[1]?.trim() ?? "";
  return token.length >= 16 && token.length <= 4096 ? token : null;
}

export async function authenticateExtensionRequest(request: Request): Promise<ExtensionPrincipal | null> {
  const token = readBearerToken(request);
  if (!token) return null;

  if (process.env.NODE_ENV === "development") {
    const developmentToken = process.env.SPRINTLY_EXTENSION_DEV_TOKEN?.trim();
    const developmentUserId = process.env.SPRINTLY_EXTENSION_DEV_USER_ID?.trim();
    if (
      developmentToken &&
      developmentUserId &&
      secureTokenEquals(token, developmentToken)
    ) {
      return {
        userId: developmentUserId,
        authMode: "development",
        deviceRecordId: null,
        deviceId: null,
        publicKeyId: null,
      };
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const tokenHash = hashExtensionToken(token);
  const { data, error } = await admin
    .from("extension_devices")
    .select("id,user_id,device_id,public_key_id,revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !data || data.revoked_at) return null;

  return {
    userId: data.user_id,
    authMode: "paired-device",
    deviceRecordId: data.id,
    deviceId: data.device_id,
    publicKeyId: data.public_key_id,
  };
}

export async function touchExtensionDevice(principal: ExtensionPrincipal) {
  if (!principal.deviceRecordId) return;
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  await admin
    .from("extension_devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", principal.deviceRecordId)
    .eq("user_id", principal.userId)
    .is("revoked_at", null);
}

