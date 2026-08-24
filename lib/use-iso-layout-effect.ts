import { useEffect, useLayoutEffect } from "react";

// Runs synchronously before paint on the client (so gate state flips are
// invisible), and falls back to useEffect during SSR where layout effects
// are not supported.
export const useIsoLayoutEffect: typeof useLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
