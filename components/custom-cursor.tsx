"use client";

import { useEffect, useRef, useState } from "react";
import { useShakeToLocate } from "./use-shake-to-locate";

const NATIVE_CURSOR_SELECTOR = ".custom-cursor-element";
const CURSOR_HOTSPOT_X = "-33.333333%";
const CURSOR_HOTSPOT_Y = "-4.166667%";

export function CustomCursor() {
  const pointerRef = useRef<SVGSVGElement>(null);
  const [usesNativeCursor, setUsesNativeCursor] = useState(false);
  const isLocating = useShakeToLocate(!usesNativeCursor);

  useEffect(() => {
    const canUseCursor = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canUseCursor.matches || reduceMotion.matches) return;

    const pointer = pointerRef.current;
    if (!pointer) return;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      pointer.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(${CURSOR_HOTSPOT_X}, ${CURSOR_HOTSPOT_Y}, 0)`;
      pointer.dataset.visible = "true";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const usesNativeCursor = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR));
      pointer.dataset.native = String(usesNativeCursor);
      setUsesNativeCursor(usesNativeCursor);
    };

    const onLeave = () => {
      pointer.dataset.visible = "false";
      pointer.dataset.native = "false";
      setUsesNativeCursor(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <svg ref={pointerRef} className="custom-cursor-pointer" aria-hidden="true" data-visible="false" data-native="false" data-locating={isLocating ? "true" : "false"} viewBox="0 0 48 48">
      <path transform="rotate(-45 16 2)" d="M16 2 L27 24 L20 20 L16 25 L12 20 L5 24 Z" fill="#1a1a1a" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
