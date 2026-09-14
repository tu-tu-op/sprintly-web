// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { line, text } from "./scene.ts";
import type { Palette, SceneNode } from "./scene";
import type { ShareMediaData } from "./types";

export function brand(x: number, y: number, colors: Palette): SceneNode[] {
  return [line(x, y, x + 16, y - 26, colors.ink, 5), line(x + 13, y, x + 29, y - 26, colors.ink, 5), text(x + 47, y, "SPRINTLY", 25, colors.ink, { weight: 700 })];
}
export function footer(height: number, data: ShareMediaData, colors: Palette): SceneNode[] {
  return [line(76, height - 124, 1004, height - 124, colors.faint), ...brand(76, height - 70, colors), text(1004, height - 70, data.date, 22, colors.muted, { align: "end" })];
}
export function codingMix(data: ShareMediaData, y: number, colors: Palette): SceneNode[] {
  if (!data.codingMix) return [];
  const entries = [[data.codingMix.manual, "MANUAL"], [data.codingMix.ai, "AI"], [data.codingMix.automation, "AUTO"], ...(data.codingMix.unknown ? [[data.codingMix.unknown, "UNKNOWN"]] : [])];
  const column = 928 / entries.length;
  return entries.flatMap(([value, label], index) => [
    line(76 + column * index, y - 58, 108 + column * index, y - 58, colors.mix[index], 5),
    text(76 + column * index, y, `${value}%`, 43, colors.ink),
    text(76 + column * index, y + 37, String(label), 21, colors.muted),
  ]);
}
export function optionalMetrics(data: ShareMediaData, y: number, colors: Palette): SceneNode[] {
  const values = data.metrics.filter((m) => m.key === "terminal" || m.key === "tokens");
  return values.length ? [text(76, y, values.map((m) => `${m.value} ${m.label.toUpperCase()}`).join("  ?  "), 21, colors.muted, { maxWidth: 928 })] : [];
}
export function clockDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((v) => String(v).padStart(2, "0")).join(":");
}
