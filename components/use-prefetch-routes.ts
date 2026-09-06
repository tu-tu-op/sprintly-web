"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
/** Warm product destinations after paint so the first click does not pay the route-load cost. */
export function usePrefetchRoutes(hrefs: readonly string[]) {
  const router = useRouter();
  const key = [...new Set(hrefs)].filter(Boolean).join("|");
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || connection?.effectiveType?.includes("2g")) return;
    const destinations = key.split("|").filter(Boolean);
    if (!destinations.length) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let cancelled = false;
    let idle: number | undefined;
    const handle = window.setTimeout(() => {
      const warm = () => {
        if (cancelled) return;
        destinations.forEach((href) => {
          if (process.env.NODE_ENV === "development") {
            const separator = href.includes("?") ? "&" : "?";
            void fetch(`${href}${separator}_rsc=${Math.random().toString(36).slice(2)}`, {
              credentials: "same-origin",
              cache: "no-store",
              headers: { RSC: "1", "Next-Router-Prefetch": "1" },
            }).catch(() => {});
          } else {
            router.prefetch(href);
          }
        });
      };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(warm, { timeout: 1000 });
      else warm();
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
      if (idle !== undefined) w.cancelIdleCallback?.(idle);
    };
  }, [key, router]);
}
