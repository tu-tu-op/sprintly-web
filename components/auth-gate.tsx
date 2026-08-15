"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/sprintly/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getAuthSession()) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname || "/app")}`);
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return <main className="grid min-h-dvh place-items-center bg-[#08090b] text-sm text-[#858c97]">Opening your Sprintly record…</main>;
  return children;
}
