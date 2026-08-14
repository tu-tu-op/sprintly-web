"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor='interactive']";
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";

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
      pointer.style.transform = `translate3d(${targetX - 2}px, ${targetY - 2}px, 0)`;
      pointer.dataset.visible = "true";
      halo.dataset.visible = "true";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      halo.dataset.variant = target?.closest(TEXT_SELECTOR)
        ? "text"
        : target?.closest(INTERACTIVE_SELECTOR)
          ? "interactive"
          : "default";
    };

    const onLeave = () => {
      pointer.dataset.visible = "false";
      halo.dataset.visible = "false";
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
      <svg ref={pointerRef} className="custom-cursor-pointer" aria-hidden="true" data-visible="false" viewBox="0 0 24 29">
        <path d="M2.4 1.7 2.3 23l5.8-5.2 4.5 9.1 4.2-2.1-4.4-8.8 8.5-.9L2.4 1.7Z" fill="#111318" stroke="#F7F5F0" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </>
  );
}
