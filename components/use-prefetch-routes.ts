"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
/** Warm at most one likely destination after paint; intent handles the rest. */
export function usePrefetchRoutes(hrefs: string[]) {
  const router = useRouter();
  const key = hrefs.join("|");
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || connection?.effectiveType?.includes("2g")) return;
    const href = key.split("|")[0];
    if (!href) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idle: number | undefined;
    const handle = window.setTimeout(() => {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => router.prefetch(href), { timeout: 1000 });
      else router.prefetch(href);
    }, 150);
    return () => {
      window.clearTimeout(handle);
      if (idle !== undefined) w.cancelIdleCallback?.(idle);
    };
  }, [key, router]);
}
