"use client";

import { useMemo } from "react";
import { renderShareSvg } from "@/lib/sprintly/share/renderer";
import { SHARE_FORMATS, resolveShareFormat } from "@/lib/sprintly/share/templates";
import type { ShareSpec } from "@/lib/sprintly/share/types";
import "./share-fonts.css";

export function SharePreview({ spec }: { spec: ShareSpec }) {
  const svg = useMemo(() => renderShareSvg(spec), [spec]);
  const format = SHARE_FORMATS[resolveShareFormat(spec.template, spec.format)];
  return (
    <figure className="share-preview min-w-0" aria-label="Post preview">
      <div className="share-preview-stage">
        <div
          className={`share-preview-art ${spec.template === "stat-sticker" ? "share-checkerboard" : ""}`}
          style={{ aspectRatio: `${format.width} / ${format.height}`, width: `min(100%, calc(62svh * ${format.width} / ${format.height}))` }}
          // The fixed scene renderer escapes all data-derived text. No HTML,
          // external resources or raw session objects enter this SVG.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[#a4a4a4]">
        <span>{format.width} × {format.height} · PNG{spec.template === "stat-sticker" ? " · Transparent" : ""}</span>
        <span>Created on your device</span>
      </figcaption>
    </figure>
  );
}
