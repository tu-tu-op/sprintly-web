"use client";

import { useEffect, useRef, useState } from "react";

export const FLIP_WINDOW_MS = 700;
export const FLIPS_TO_TRIGGER = 4;
export const MIN_SPEED = 0.6;
export const LOCATE_DURATION = 1200;

const FINE_POINTER_QUERY = "(pointer: fine) and (hover: hover)";

export function useShakeToLocate(enabled = true) {
  const [isLocating, setIsLocating] = useState(false);
  const locateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLocating(false);
      return;
    }

    const canUseCursor = window.matchMedia(FINE_POINTER_QUERY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canUseCursor.matches || reduceMotion.matches) {
      setIsLocating(false);
      return;
    }

    let previousX: number | null = null;
    let previousTime = 0;
    let previousDirection = 0;
    let flipTimes: number[] = [];

    const clearLocateTimeout = () => {
      if (locateTimeoutRef.current === null) return;

      window.clearTimeout(locateTimeoutRef.current);
      locateTimeoutRef.current = null;
    };

    const triggerLocate = () => {
      setIsLocating(true);
      clearLocateTimeout();
      locateTimeoutRef.current = window.setTimeout(() => {
        locateTimeoutRef.current = null;
        setIsLocating(false);
      }, LOCATE_DURATION);
    };

    const onMouseMove = (event: MouseEvent) => {
      const now = performance.now();

      if (previousX === null) {
        previousX = event.clientX;
        previousTime = now;
        return;
      }

      const dx = event.clientX - previousX;
      const dt = now - previousTime;
      previousX = event.clientX;
      previousTime = now;

      if (dt <= 0) return;

      const direction = Math.sign(dx);
      if (direction === 0) return;

      const speed = Math.abs(dx) / dt;
      flipTimes = flipTimes.filter((time) => now - time <= FLIP_WINDOW_MS);

      const isDirectionFlip = previousDirection !== 0 && direction !== previousDirection;
      previousDirection = direction;

      if (!isDirectionFlip || speed < MIN_SPEED) return;

      flipTimes.push(now);
      if (flipTimes.length < FLIPS_TO_TRIGGER) return;

      flipTimes = [];
      triggerLocate();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearLocateTimeout();
    };
  }, [enabled]);

  return isLocating;
}
