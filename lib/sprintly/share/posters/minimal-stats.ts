// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { brand, clockDuration, codingMix, footer, optionalMetrics } from "../poster-layout.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { line, text, wrapText } from "../scene.ts";
import type { Palette, SceneNode } from "../scene";
import type { ShareMediaData } from "../types";

export function minimalStats(data: ShareMediaData, height: number, colors: Palette): SceneNode[] {
  const story = height > 1500;
  const primary = data.type === "session" ? clockDuration(data.activity?.codingSeconds ?? 0) : data.primaryMetric.value.toUpperCase();
  const y = Math.round(height * 0.36);
  const nodes: SceneNode[] = [
    ...brand(76, story ? 160 : 101, colors),
    text(76, y - 106, data.primaryMetric.label.toUpperCase(), 23, colors.muted),
    text(68, y + 45, primary, 156, colors.ink, { weight: 600, maxWidth: 940 }),
    line(76, y + 108, 1004, y + 108, colors.ink, 2),
  ];
  const headline = data.type === "session" ? `FOCUS ${data.scores?.focus ?? "?"}` : data.type === "weekly" ? `${data.activity?.sessions ?? 0} SESSIONS` : data.title.toUpperCase();
  wrapText(headline, 28).forEach((value, index) => nodes.push(text(76, y + 209 + index * 53, value, 45, colors.accent, { maxWidth: 928 })));
  if (story) nodes.push(text(76, y + 403, data.archetype?.toUpperCase() ?? "", 31, colors.muted, { font: "sans", maxWidth: 920 }));
  nodes.push(...codingMix(data, height - 252, colors), ...optionalMetrics(data, height - 150, colors), ...footer(height, data, colors));
  return nodes;
}
