// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { devprint } from "../devprint.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { brand, footer, optionalMetrics } from "../poster-layout.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { line, text, wrapText } from "../scene.ts";
import type { Palette, SceneNode } from "../scene";
import type { ShareMediaData } from "../types";

export function personalRecord(data: ShareMediaData, height: number, colors: Palette): SceneNode[] {
  const story = height > 1500;
  const achievement = data.type === "achievement";
  const record = data.record;
  const eyebrow = achievement ? "ACHIEVEMENT UNLOCKED" : data.type === "streak" ? "KEEP SHOWING UP" : record?.isNew ? "NEW PERSONAL RECORD" : "PERSONAL BEST";
  const nodes: SceneNode[] = [
    ...brand(76, story ? 160 : 101, colors),
    ...devprint(data, 876, story ? 352 : 252, 111, colors),
    line(76, height * 0.23, 192, height * 0.23, colors.accent, 5),
    text(76, height * 0.23 + 56, eyebrow, 25, colors.accent, { maxWidth: 780 }),
  ];
  if (achievement) {
    const lines = wrapText(data.achievement?.title.toUpperCase() ?? data.primaryMetric.value.toUpperCase(), 16);
    lines.forEach((value, index) => nodes.push(text(68, height * 0.44 + index * 117, value, 105, colors.ink, { font: "sans", weight: 600, maxWidth: 936 })));
    wrapText(data.achievement?.description ?? "", 48).forEach((value, index) => nodes.push(text(76, height - 360 + index * 43, value, 28, colors.muted, { font: "sans", maxWidth: 920 })));
  } else {
    nodes.push(text(76, height * 0.39, (record?.label ?? data.primaryMetric.label).toUpperCase(), 36, colors.muted, { maxWidth: 928 }));
    nodes.push(text(60, height * 0.39 + 248, (record?.value ?? data.primaryMetric.value).toUpperCase(), 254, colors.ink, { weight: 700, maxWidth: 950 }));
    if (record?.previous !== undefined) nodes.push(text(76, height * 0.39 + 328, `PREVIOUS BEST  ${record.previous.toUpperCase()}`, 26, colors.accent, { maxWidth: 928 }));
    else nodes.push(text(76, height * 0.39 + 328, data.type === "streak" ? "ONE DAY AT A TIME." : "FROM YOUR AVAILABLE HISTORY.", 24, colors.muted));
  }
  nodes.push(...optionalMetrics(data, height - 160, colors), ...footer(height, data, colors));
  return nodes;
}
