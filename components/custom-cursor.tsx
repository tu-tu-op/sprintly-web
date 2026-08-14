"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor='interactive']";
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canUseCursor = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!canUseCursor.matches || reduceMotion.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frame = 0;

    document.documentElement.classList.add("has-custom-cursor");

    const render = () => {
      ringX += (targetX - ringX) * 0.17;
      ringY += (targetY - ringY) * 0.17;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      dot.dataset.visible = "true";
      ring.dataset.visible = "true";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      ring.dataset.variant = target?.closest(TEXT_SELECTOR)
        ? "text"
        : target?.closest(INTERACTIVE_SELECTOR)
          ? "interactive"
          : "default";
    };

    const onLeave = () => {
      dot.dataset.visible = "false";
      ring.dataset.visible = "false";
    };

    const onDown = () => { ring.dataset.pressed = "true"; };
    const onUp = () => { ring.dataset.pressed = "false"; };

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
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" data-visible="false" data-variant="default" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" data-visible="false" />
    </>
  );
}
