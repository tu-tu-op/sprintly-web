import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION, serializeSprintlyExport, sprintlySessionSchema } from "@/lib/sprintly/contract";
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
    .from("sessions")
    .select("aggregate_payload,signature,public_key_id")
    .eq("user_id", identity.userId)
    .order("started_at", { ascending: false });
  if (error) return jsonError("Unable to export synchronized sessions", 500);

  const sessions = (data ?? []).flatMap((row: Record<string, unknown>) => {
    const payload = row.aggregate_payload && typeof row.aggregate_payload === "object"
      ? row.aggregate_payload as Record<string, unknown>
      : {};
    const parsed = sprintlySessionSchema.safeParse({
      ...payload,
      contract: SPRINTLY_CONTRACT,
      schemaVersion: SPRINTLY_SCHEMA_VERSION,
      signature: typeof row.signature === "string" ? row.signature : undefined,
      publicKeyId: typeof row.public_key_id === "string" ? row.public_key_id : undefined,
    });
    return parsed.success ? [parsed.data] : [];
  });

  return new Response(serializeSprintlyExport(sessions), {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="sprintly-synchronized-sessions.json"',
    },
  });
}

