// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { devprint } from "../devprint.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { brand, codingMix, footer, optionalMetrics } from "../poster-layout.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { text } from "../scene.ts";
import type { Palette, SceneNode } from "../scene";
import type { ShareMediaData } from "../types";

export function sessionHero(data: ShareMediaData, height: number, colors: Palette): SceneNode[] {
  const story = height > 1500, square = height === 1080;
  const titleY = story ? 278 : square ? 171 : 210;
  const metricY = story ? 451 : square ? 296 : 368;
  const nodes: SceneNode[] = [
    ...brand(76, story ? 160 : 101, colors),
    text(1004, story ? 160 : 101, data.type.toUpperCase(), 22, colors.muted, { align: "end" }),
    text(76, titleY, data.type === "session" ? "THE WORK ADDS UP." : data.title.toUpperCase(), 25, colors.muted, { maxWidth: 928 }),
    text(68, metricY, data.primaryMetric.value.toUpperCase(), story ? 162 : square ? 132 : 150, colors.ink, { weight: 700, maxWidth: 940 }),
    text(76, metricY + 70, (data.archetype ?? data.primaryMetric.label).toUpperCase(), 38, colors.accent, { font: "sans", weight: 600, maxWidth: 920 }),
  ];
  if (story) {
    nodes.push(...devprint(data, 540, 993, 356, colors));
    nodes.push(text(540, 1400, "YOUR DEVPRINT", 21, colors.muted, { align: "middle" }));
    nodes.push(text(76, 1471, "FOCUS", 23, colors.muted), text(610, 1471, "RECOVERY", 23, colors.muted));
    nodes.push(text(76, 1572, String(data.scores?.focus ?? "?"), 98, colors.ink), text(610, 1572, String(data.scores?.recovery ?? "?"), 98, colors.ink));
  } else {
    const cy = square ? 588 : 766, radius = square ? 206 : 260;
    nodes.push(...devprint(data, 730, cy, radius, colors));
    nodes.push(text(76, cy - 90, "FOCUS", 23, colors.muted), text(70, cy + 8, String(data.scores?.focus ?? "?"), 98, colors.ink));
    nodes.push(text(76, cy + 90, "RECOVERY", 21, colors.muted), text(73, cy + 168, String(data.scores?.recovery ?? "?"), 76, colors.ink));
  }
  nodes.push(...codingMix(data, height - 230, colors), ...optionalMetrics(data, height - 148, colors), ...footer(height, data, colors));
  return nodes;
}
