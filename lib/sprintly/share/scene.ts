import type { ShareTheme } from "./types";

export type SceneNode =
  | { kind: "text"; x: number; y: number; value: string; size: number; font: "mono" | "sans"; weight: number; fill: string; align: "start" | "middle" | "end" }
  | { kind: "rect"; x: number; y: number; width: number; height: number; fill: string; radius: number }
  | { kind: "circle"; x: number; y: number; radius: number; fill: string; stroke: string; strokeWidth: number }
  | { kind: "path"; d: string; stroke: string; strokeWidth: number; fill: string };
export type ShareScene = { width: number; height: number; background: string | null; nodes: SceneNode[]; description: string };
export type Palette = { background: string; ink: string; muted: string; faint: string; accent: string; mix: string[] };
export const SHARE_FONTS = { mono: "Sprintly Share Mono", sans: "Sprintly Share Sans" };

export function palette(theme: ShareTheme): Palette {
  return theme === "paper"
    ? { background: "#eeeae2", ink: "#17191d", muted: "#5c6268", faint: "#d5d1c9", accent: "#496a78", mix: ["#242a30", "#607d8b", "#9b968a", "#c5c0b7"] }
    : { background: "#0c0e11", ink: "#f2f0e9", muted: "#969da6", faint: "#262b32", accent: "#adc5ce", mix: ["#eceae3", "#99b5c2", "#747e8e", "#454c55"] };
}

export function text(x: number, y: number, value: string, size: number, fill: string, options: { font?: "mono" | "sans"; weight?: number; align?: "start" | "middle" | "end"; maxWidth?: number } = {}): SceneNode {
  const font = options.font ?? "mono";
  // Conservative fixed font metrics keep both preview and canvas inside the same bounds.
  const fitted = options.maxWidth ? Math.min(size, options.maxWidth / Math.max(1, Array.from(value).length * (font === "mono" ? 0.61 : 0.62))) : size;
  return { kind: "text", x, y, value, size: fitted, fill, font, weight: options.weight ?? 500, align: options.align ?? "start" };
}
export function rect(x: number, y: number, width: number, height: number, fill: string, radius = 0): SceneNode {
  return { kind: "rect", x, y, width, height, fill, radius };
}
export function circle(x: number, y: number, radius: number, stroke: string, strokeWidth = 1, fill = "none"): SceneNode {
  return { kind: "circle", x, y, radius, stroke, strokeWidth, fill };
}
export function line(x1: number, y1: number, x2: number, y2: number, stroke: string, strokeWidth = 1): SceneNode {
  return { kind: "path", d: `M ${x1} ${y1} L ${x2} ${y2}`, stroke, strokeWidth, fill: "none" };
}
const point = (x: number, y: number, r: number, a: number) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
export function arc(x: number, y: number, radius: number, start: number, end: number, stroke: string, strokeWidth: number): SceneNode {
  const a = point(x, y, radius, start), b = point(x, y, radius, end);
  return { kind: "path", d: `M ${a[0]} ${a[1]} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${b[0]} ${b[1]}`, stroke, strokeWidth, fill: "none" };
}

export function wrapText(value: string, maxCharacters: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && last.length + word.length < maxCharacters) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
}

export function sceneToSvg(scene: ShareScene): string {
  const nodes = scene.nodes.map((node) => {
    switch (node.kind) {
      case "text": return `<text x="${node.x}" y="${node.y}" font-family="${SHARE_FONTS[node.font]}" font-size="${node.size}" font-weight="${node.weight}" fill="${node.fill}" text-anchor="${node.align}">${escapeXml(node.value)}</text>`;
      case "rect": return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.radius}" fill="${node.fill}"/>`;
      case "circle": return `<circle cx="${node.x}" cy="${node.y}" r="${node.radius}" fill="${node.fill}" stroke="${node.stroke}" stroke-width="${node.strokeWidth}"/>`;
      case "path": return `<path d="${node.d}" fill="${node.fill}" stroke="${node.stroke}" stroke-width="${node.strokeWidth}"/>`;
    }
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img"><title>${escapeXml(scene.description)}</title>${scene.background ? `<rect width="100%" height="100%" fill="${scene.background}"/>` : ""}${nodes}</svg>`;
}
