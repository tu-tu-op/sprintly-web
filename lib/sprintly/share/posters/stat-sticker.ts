// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { devprint } from "../devprint.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { brand, codingMix, optionalMetrics } from "../poster-layout.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { text } from "../scene.ts";
import type { Palette, SceneNode } from "../scene";
import type { ShareMediaData } from "../types";

export function statSticker(data: ShareMediaData, _height: number, colors: Palette): SceneNode[] {
  return [
    ...brand(76, 90, colors),
    text(76, 171, data.primaryMetric.label.toUpperCase(), 22, colors.muted),
    text(68, 304, data.primaryMetric.value.toUpperCase(), 130, colors.ink, { weight: 700, maxWidth: 910 }),
    text(76, 362, (data.archetype ?? data.title).toUpperCase(), 29, colors.accent, { font: "sans", weight: 600, maxWidth: 900 }),
    text(76, 454, "FOCUS", 21, colors.muted),
    text(76, 526, String(data.scores?.focus ?? "?"), 66, colors.ink),
    text(368, 454, "RECOVERY", 21, colors.muted),
    text(368, 526, String(data.scores?.recovery ?? "?"), 66, colors.ink),
    ...devprint(data, 862, 475, 103, colors),
    ...codingMix(data, 650, colors),
    ...optionalMetrics(data, 728, colors),
  ];
}
