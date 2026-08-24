"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";

const IDLE_TIMEOUT_MS = 1500;

/**
 * Warms the router cache for the given destinations right after mount,
 * during browser idle time. Combined with per-route code splitting this
 * makes the first click on a never-visited page feel instant in
 * production builds (chunks + RSC payloads are already local).
 */
export function usePrefetchRoutes(hrefs: string[]) {
  const router = useRouter();
  const key = hrefs.join("|");
  const scheduled = useRef(false);

  useIsoLayoutEffect(() => {
    if (scheduled.current) return;
    scheduled.current = true;
    const list = key.split("|");
    const run = () => { for (const href of list) router.prefetch(href); };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS }) : window.setTimeout(run, 200);
    return () => {
      if (w.cancelIdleCallback && typeof handle === "number") w.cancelIdleCallback(handle);
      else window.clearTimeout(handle as number);
    };
  }, [key, router]);
}
