"use client";

import { useEffect, useRef } from "react";

const NATIVE_CURSOR_SELECTOR = ".custom-cursor-element";

export function CustomCursor() {
  const pointerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const canUseCursor = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canUseCursor.matches || reduceMotion.matches) return;

    const pointer = pointerRef.current;
    if (!pointer) return;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      pointer.style.transform = `translate3d(${event.clientX - 16}px, ${event.clientY - 2}px, 0)`;
      pointer.dataset.visible = "true";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const usesNativeCursor = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR));
      pointer.dataset.native = String(usesNativeCursor);
    };

    const onLeave = () => {
      pointer.dataset.visible = "false";
      pointer.dataset.native = "false";
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
    <svg ref={pointerRef} className="custom-cursor-pointer" aria-hidden="true" data-visible="false" data-native="false" viewBox="0 0 48 48">
      <path transform="rotate(-45 16 2)" d="M16 2 L27 24 L20 20 L16 25 L12 20 L5 24 Z" fill="#1a1a1a" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
