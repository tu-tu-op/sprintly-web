// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { SHARE_TEMPLATES, supportsTemplate } from "./templates.ts";
import type { ShareMediaData, ShareTemplate } from "./types";

export function recommendShare(data: ShareMediaData): ShareTemplate {
  if (data.type === "record" || data.record?.isNew) return "personal-record";
  if (data.type === "streak" || data.type === "achievement") return "personal-record";
  if (data.type === "weekly") return "week-in-code";
  return "session-hero";
}

export function templatesFor(data: ShareMediaData) {
  const recommended = recommendShare(data);
  return SHARE_TEMPLATES.filter((template) => supportsTemplate(template.id, data))
    .sort((a, b) => Number(b.id === recommended) - Number(a.id === recommended));
}
