// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { brand, footer, optionalMetrics } from "../poster-layout.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { line, rect, text } from "../scene.ts";
import type { Palette, SceneNode } from "../scene";
import type { ShareMediaData } from "../types";

export function weekInCode(data: ShareMediaData, height: number, colors: Palette): SceneNode[] {
  const story = height > 1500, square = height === 1080;
  const nodes: SceneNode[] = [
    ...brand(76, story ? 160 : 101, colors),
    text(1004, story ? 160 : 101, data.week?.id ?? "", 23, colors.muted, { align: "end" }),
    text(76, story ? 310 : 208, "MY WEEK IN CODE", 31, colors.accent),
    text(68, story ? 500 : 370, data.primaryMetric.value.toUpperCase(), 160, colors.ink, { weight: 700, maxWidth: 940 }),
    text(76, story ? 595 : 450, `${data.activity?.sessions ?? 0} SESSIONS`, 41, colors.muted),
  ];
  const chartBottom = story ? 1330 : square ? 721 : 964;
  const chartHeight = story ? 430 : square ? 160 : 300;
  const days = data.week?.days ?? [];
  const max = Math.max(1, ...days.map((day) => day.seconds));
  nodes.push(text(76, chartBottom - chartHeight - 43, "DAILY CODING TIME", 20, colors.muted));
  nodes.push(line(76, chartBottom, 1004, chartBottom, colors.faint));
  days.forEach((day, index) => {
    const x = 91 + index * 133;
    const barHeight = day.seconds / max * chartHeight;
    if (day.seconds > 0) nodes.push(rect(x, chartBottom - barHeight, 100, barHeight, day.seconds === max ? colors.ink : colors.accent, 3));
    else nodes.push(line(x + 40, chartBottom - 5, x + 60, chartBottom - 5, colors.muted, 2));
    nodes.push(text(x + 50, chartBottom + 46, day.label, 25, colors.muted, { align: "middle" }));
  });
  const statsY = height - 252;
  [[data.scores?.devScore ?? 0, "DEV SCORE"], [data.streak ?? 0, "DAY STREAK"], [data.scores?.focus ?? 0, "AVG FOCUS"]].forEach(([value, label], index) => {
    const x = 76 + index * 324;
    nodes.push(text(x, statsY, String(value), 62, colors.ink));
    nodes.push(text(x, statsY + 45, String(label), 20, colors.muted));
  });
  nodes.push(...optionalMetrics(data, height - 149, colors), ...footer(height, data, colors));
  return nodes;
}
