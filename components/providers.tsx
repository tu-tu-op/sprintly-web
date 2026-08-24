"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { CustomCursor } from "./custom-cursor";

export function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const canUseSmoothScroll = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!canUseSmoothScroll) return;

    let cancelled = false;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let idleCallback: number | null = null;
    let fallbackTimeout: number | null = null;

    const start = () => {
      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;

        lenis = new Lenis({ duration: 1.05, smoothWheel: true });
        const raf = (time: number) => {
          lenis?.raf(time);
          frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);
      });
    };

    const idleApi = window as unknown as {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleApi.requestIdleCallback) {
      idleCallback = idleApi.requestIdleCallback(start, { timeout: 800 });
    } else {
      fallbackTimeout = window.setTimeout(start, 250);
    }

    return () => {
      cancelled = true;
      if (idleCallback !== null) idleApi.cancelIdleCallback?.(idleCallback);
      if (fallbackTimeout !== null) window.clearTimeout(fallbackTimeout);
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return <>{children}<CustomCursor /><Toaster theme="dark" position="bottom-right" richColors /></>;
}
