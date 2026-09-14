// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { SHARE_FORMATS, resolveShareFormat, supportsTemplate } from "./templates.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { palette, sceneToSvg } from "./scene.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { sessionHero } from "./posters/session-hero.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { minimalStats } from "./posters/minimal-stats.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { statSticker } from "./posters/stat-sticker.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { personalRecord } from "./posters/personal-record.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { weekInCode } from "./posters/week-in-code.ts";
import type { ShareScene } from "./scene";
import type { ShareSpec } from "./types";

const posters = { "session-hero": sessionHero, "minimal-stats": minimalStats, "stat-sticker": statSticker, "personal-record": personalRecord, "week-in-code": weekInCode };

export function buildShareScene(spec: ShareSpec): ShareScene {
  if (spec.version !== 1 || !supportsTemplate(spec.template, spec.data)) throw new Error("This style is not available for this post.");
  const format = SHARE_FORMATS[resolveShareFormat(spec.template, spec.format)];
  const colors = palette(spec.theme);
  return {
    width: format.width, height: format.height,
    background: spec.template === "stat-sticker" ? null : colors.background,
    nodes: posters[spec.template](spec.data, format.height, colors),
    description: `${spec.data.title}. ${spec.data.primaryMetric.label}: ${spec.data.primaryMetric.value}. ${spec.data.metrics.map((m) => `${m.label}: ${m.value}`).join(". ")}`,
  };
}

/** Lightweight vector preview; final-resolution PNG is produced only on action. */
export function renderShareSvg(spec: ShareSpec) {
  return sceneToSvg(buildShareScene(spec));
}
