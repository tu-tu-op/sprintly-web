import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION } from "@/lib/sprintly/contract";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      ok: true,
      contract: SPRINTLY_CONTRACT,
      schemaVersion: SPRINTLY_SCHEMA_VERSION,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

