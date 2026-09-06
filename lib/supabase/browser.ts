"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/lib/sprintly/config";

let browserClient: SupabaseClient | null | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient !== undefined) return browserClient;

  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createBrowserClient(url, key);
  return browserClient;
}

