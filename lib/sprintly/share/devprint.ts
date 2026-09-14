// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { arc, circle, line } from "./scene.ts";
import type { Palette, SceneNode } from "./scene";
import type { ShareMediaData } from "./types";

/**
 * A nonchronological metric composition. Rings = coding proportions, five
 * radial sectors = scores, ring/tick density = duration, inner arcs = optional
 * terminal categories. No random values, pseudo events, IDs or raw activity.
 */
export function devprint(data: ShareMediaData, x: number, y: number, radius: number, colors: Palette): SceneNode[] {
  const nodes: SceneNode[] = [];
  const turn = Math.PI * 2;
  const mix = data.codingMix ? [data.codingMix.manual, data.codingMix.ai, data.codingMix.automation, data.codingMix.unknown] : [];
  const seconds = data.activity?.codingSeconds ?? 0;
  const rings = 3 + Math.min(6, Math.floor(seconds / 1800));
  for (let ring = 0; ring < rings; ring++) {
    const r = radius * (0.44 + ring * 0.034);
    let cursor = -Math.PI / 2;
    mix.forEach((value, index) => {
      const length = value / 100 * turn;
      if (length > 0) nodes.push(arc(x, y, r, cursor + Math.min(0.018, length / 4), cursor + length - Math.min(0.018, length / 4), colors.mix[index], radius * 0.014));
      cursor += length;
    });
  }
  nodes.push(circle(x, y, radius * 0.78, colors.faint));
  const scores = data.scores ? [data.scores.focus, data.scores.consistency, data.scores.testing, data.scores.recovery, data.scores.aiBalance] : [0, 0, 0, 0, 0];
  const repetitions = 6 + Math.min(14, Math.floor(seconds / 1200));
  for (let sector = 0; sector < 5; sector++) {
    for (let index = 0; index < repetitions; index++) {
      const angle = -Math.PI / 2 + (sector + (index + 0.3) / repetitions) / 5 * turn;
      const inner = radius * 0.83;
      const outer = radius * (0.86 + Math.max(0, Math.min(100, scores[sector])) / 100 * 0.14);
      nodes.push(line(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner, x + Math.cos(angle) * outer, y + Math.sin(angle) * outer, sector % 2 ? colors.accent : colors.ink, radius * 0.005));
    }
  }
  nodes.push(circle(x, y, radius * 0.26, colors.faint));
  nodes.push(line(x - radius * 0.06, y, x + radius * 0.06, y, colors.muted, 1.5));
  nodes.push(line(x, y - radius * 0.06, x, y + radius * 0.06, colors.muted, 1.5));
  if (data.terminal) {
    const values = [data.terminal.build, data.terminal.test, data.terminal.git, data.terminal.other];
    const total = values.reduce((sum, value) => sum + value, 0);
    let cursor = -Math.PI / 2;
    values.forEach((value, index) => {
      const length = total ? value / total * turn : 0;
      if (length > 0) nodes.push(arc(x, y, radius * 0.34, cursor + Math.min(0.025, length / 4), cursor + length - Math.min(0.025, length / 4), colors.mix[index], radius * 0.018));
      cursor += length;
    });
  }
  return nodes;
}
