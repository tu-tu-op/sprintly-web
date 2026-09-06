import { z } from "zod";

import { getWebsiteIdentity } from "@/lib/sprintly/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const profilePatchSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  handle: z.string().trim().toLowerCase().regex(/^[a-z0-9_][a-z0-9_-]{2,31}$/),
  city: z.string().trim().max(120),
  region: z.string().trim().max(120),
  country: z.string().trim().max(120),
  bio: z.string().max(1000),
  avatarUrl: z.string().url().max(1000).nullable(),
  avatarStyle: z.enum(["gradient", "mono", "signal"]),
}).partial().strict();

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
  const parsed = profilePatchSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Invalid profile", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Remote synchronization is not configured", 503);

  const databasePatch = {
    ...(parsed.data.displayName === undefined ? {} : { display_name: parsed.data.displayName }),
    ...(parsed.data.handle === undefined ? {} : { handle: parsed.data.handle }),
    ...(parsed.data.city === undefined ? {} : { city_label: parsed.data.city }),
    ...(parsed.data.region === undefined ? {} : { region: parsed.data.region }),
    ...(parsed.data.country === undefined ? {} : { country: parsed.data.country }),
    ...(parsed.data.bio === undefined ? {} : { bio: parsed.data.bio }),
    ...(parsed.data.avatarUrl === undefined ? {} : { avatar_url: parsed.data.avatarUrl }),
    ...(parsed.data.avatarStyle === undefined ? {} : { avatar_style: parsed.data.avatarStyle }),
  };
  if (!Object.keys(databasePatch).length) return Response.json({ ok: true });

  const { error } = await admin
    .from("profiles")
    .update(databasePatch)
    .eq("user_id", identity.userId);
  if (error) {
    if (error.code === "23505") return jsonError("That handle is already in use", 409);
    return jsonError("Unable to save profile", 500);
  }

  return Response.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}

