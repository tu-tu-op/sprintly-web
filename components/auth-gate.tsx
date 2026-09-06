"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAuthSession } from "@/lib/sprintly/auth";
import { hasSupabasePublicConfig } from "@/lib/sprintly/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { AppSkeleton } from "./app-skeleton";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useIsoLayoutEffect(() => {
    let cancelled = false;
    void (async () => {
      let authenticated = Boolean(getAuthSession());
      if (hasSupabasePublicConfig()) {
        const supabase = createSupabaseBrowserClient();
        const result = supabase ? await supabase.auth.getUser() : { data: { user: null } };
        authenticated = Boolean(result.data.user);
      }
      if (cancelled) return;
      if (!authenticated) {
        router.replace(`/sign-in?next=${encodeURIComponent(pathname || "/app")}`);
        return;
      }
      setChecked(true);
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);

  if (!checked) return <AppSkeleton />;
  return children;
}

