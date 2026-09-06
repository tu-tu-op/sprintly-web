import "server-only";

import { cookies } from "next/headers";

import { hasSupabasePublicConfig } from "@/lib/sprintly/config";
import {
  DEMO_AUTH_COOKIE,
  DEMO_USER_ID,
  DEMO_CREDENTIALS,
} from "@/lib/sprintly/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WebsiteIdentity = {
  userId: string;
  email: string | null;
  displayName: string;
  mode: "supabase" | "demo";
};

export async function getWebsiteIdentity(): Promise<WebsiteIdentity | null> {
  if (hasSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const displayName =
      typeof data.user.user_metadata?.display_name === "string"
        ? data.user.user_metadata.display_name
        : data.user.email?.split("@")[0] ?? "Sprintly user";

    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      displayName,
      mode: "supabase",
    };
  }

  const cookieStore = await cookies();
  if (cookieStore.get(DEMO_AUTH_COOKIE)?.value !== "1") return null;

  return {
    userId: DEMO_USER_ID,
    email: DEMO_CREDENTIALS.email,
    displayName: "Alex Rivera",
    mode: "demo",
  };
}

