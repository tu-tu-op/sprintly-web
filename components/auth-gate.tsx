"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/sprintly/auth";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { AppSkeleton } from "./app-skeleton";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useIsoLayoutEffect(() => {
    if (!getAuthSession()) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname || "/app")}`);
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return <AppSkeleton />;
  return children;
}
