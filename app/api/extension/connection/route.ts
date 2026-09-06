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

  const [devicesResult, sessionsResult] = await Promise.all([
    admin.from("extension_devices").select("id,last_seen_at,revoked_at").eq("user_id", identity.userId),
    admin.from("sessions").select("received_at").eq("user_id", identity.userId).order("received_at", { ascending: false }).limit(1),
  ]);
  if (devicesResult.error || sessionsResult.error) return jsonError("Unable to test the remote connection", 500);

  const activeDevices = (devicesResult.data ?? []).filter((device: { revoked_at: string | null }) => !device.revoked_at);
  return Response.json(
    {
      ok: true,
      remote: "supabase",
      deviceCount: activeDevices.length,
      lastSyncAt: sessionsResult.data?.[0]?.received_at ?? null,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

