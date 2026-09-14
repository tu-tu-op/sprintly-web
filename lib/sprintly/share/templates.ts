import type { ShareFormat, ShareMediaData, ShareTemplate, ShareTheme } from "./types";

export const SHARE_FORMATS: Record<ShareFormat, { label: string; width: number; height: number; description: string }> = {
  story: { label: "Story", width: 1080, height: 1920, description: "Stories & status" },
  portrait: { label: "Portrait", width: 1080, height: 1350, description: "Feed & social posts" },
  square: { label: "Square", width: 1080, height: 1080, description: "Anywhere" },
  sticker: { label: "Sticker", width: 1080, height: 760, description: "Transparent PNG" },
};

export const SHARE_TEMPLATES: Array<{ id: ShareTemplate; label: string; shortLabel: string; description: string }> = [
  { id: "session-hero", label: "Session Hero", shortLabel: "Hero", description: "Your work, with a signature Devprint." },
  { id: "minimal-stats", label: "Minimal Stats", shortLabel: "Minimal", description: "Strong numbers. Room to breathe." },
  { id: "stat-sticker", label: "Sprintly Sticker", shortLabel: "Sticker", description: "Transparent stats for your own backdrop." },
  { id: "personal-record", label: "Personal Record", shortLabel: "Record", description: "Give your accomplishment the spotlight." },
  { id: "week-in-code", label: "Week in Code", shortLabel: "Week", description: "Seven days. One story." },
];

export const SHARE_THEMES: Array<{ id: ShareTheme; label: string; color: string }> = [
  { id: "graphite", label: "Graphite", color: "#17191d" },
  { id: "paper", label: "Paper", color: "#eeeae2" },
];

export function supportsTemplate(template: ShareTemplate, data: ShareMediaData) {
  if (template === "week-in-code") return data.type === "weekly" && Boolean(data.week);
  if (template === "personal-record") return Boolean(data.record) || data.type === "streak" || data.type === "achievement";
  return true;
}

export function resolveShareFormat(template: ShareTemplate, requested: ShareFormat): ShareFormat {
  return template === "stat-sticker" ? "sticker" : requested === "sticker" ? "portrait" : requested;
}
