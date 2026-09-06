import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function GET() {
  const identity = await getWebsiteIdentity();
  if (!identity) return jsonError("Website authentication is required", 401);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const { data, error } = await admin
    .from("extension_devices")
    .select("id,device_id,device_name,device_type,public_key_id,created_at,last_seen_at,revoked_at")
    .eq("user_id", identity.userId)
    .order("created_at", { ascending: false });

  if (error) return jsonError("Unable to load extension devices", 500);

  return Response.json(
    { ok: true, devices: data ?? [] },
    { headers: { "cache-control": "no-store" } },
  );
}

