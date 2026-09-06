import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function DELETE() {
  const identity = await getWebsiteIdentity();
  if (!identity) return jsonError("Website authentication is required", 401);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const { error } = await admin
    .from("sessions")
    .delete()
    .eq("user_id", identity.userId);
  if (error) return jsonError("Unable to delete synchronized sessions", 500);

  const { error: revokeError } = await admin.rpc("revoke_user_leaderboard_entries", { target_user_id: identity.userId });
  if (revokeError) return jsonError("Unable to revoke related leaderboard entries", 500);

  return Response.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}

