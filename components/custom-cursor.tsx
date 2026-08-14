"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor='interactive']";
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";
const NATIVE_CURSOR_SELECTOR = ".custom-cursor-element";

export function CustomCursor() {
  const pointerRef = useRef<SVGSVGElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canUseCursor = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canUseCursor.matches || reduceMotion.matches) return;

    const pointer = pointerRef.current;
    const halo = haloRef.current;
    if (!pointer || !halo) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let haloX = targetX + 8;
    let haloY = targetY + 11;
    let frame = 0;

    document.documentElement.classList.add("has-custom-cursor");

    const render = () => {
      haloX += (targetX + 8 - haloX) * 0.24;
      haloY += (targetY + 11 - haloY) * 0.24;
      halo.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      pointer.style.transform = `translate3d(${targetX - 16}px, ${targetY - 2}px, 0)`;
      pointer.dataset.visible = "true";
      halo.dataset.visible = "true";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const usesNativeCursor = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR));
      pointer.dataset.native = String(usesNativeCursor);
      halo.dataset.native = String(usesNativeCursor);
      halo.dataset.variant = target?.closest(TEXT_SELECTOR)
        ? "text"
        : target?.closest(INTERACTIVE_SELECTOR)
          ? "interactive"
          : "default";
    };

    const onLeave = () => {
      pointer.dataset.visible = "false";
      halo.dataset.visible = "false";
      pointer.dataset.native = "false";
      halo.dataset.native = "false";
    };

    const onDown = () => { halo.dataset.pressed = "true"; };
    const onUp = () => { halo.dataset.pressed = "false"; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="custom-cursor-halo" aria-hidden="true" data-visible="false" data-variant="default" />
      <svg ref={pointerRef} className="custom-cursor-pointer" aria-hidden="true" data-visible="false" data-native="false" viewBox="0 0 32 32">
        <path d="M16 2 L27 24 L20 20 L16 25 L12 20 L5 24 Z" fill="#1a1a1a" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </>
  );
}
