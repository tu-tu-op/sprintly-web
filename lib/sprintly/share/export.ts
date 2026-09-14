// Loaded dynamically by the action controls, never by the preview.
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { buildShareScene } from "./renderer.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { SHARE_FONTS } from "./scene.ts";
import type { ShareSpec } from "./types";

let fontsReady: Promise<void> | undefined;
export function loadShareFonts() {
  if (!fontsReady) fontsReady = (async () => {
    await Promise.all([
      ["mono", "/share-fonts/jetbrains-mono-latin-wght-normal.woff2"],
      ["sans", "/share-fonts/ibm-plex-sans-latin-wght-normal.woff2"],
    ].map(async ([name, url]) => {
      const family = SHARE_FONTS[name as keyof typeof SHARE_FONTS];
      const existing = await document.fonts.load(`600 20px "${family}"`);
      if (existing.length) return;
      const font = new FontFace(family, `url("${url}")`, { weight: "100 800", style: "normal" });
      document.fonts.add(await font.load());
    }));
  })().catch((error: unknown) => { fontsReady = undefined; throw error; });
  return fontsReady;
}

/** Native canvas draws the same fixed scene as SVG; no page screenshot or upload. */
export async function renderShareImage(spec: ShareSpec): Promise<Blob> {
  await loadShareFonts();
  const scene = buildShareScene(spec);
  const canvas = document.createElement("canvas");
  canvas.width = scene.width;
  canvas.height = scene.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image creation is unavailable. Please try another browser.");
  try {
    if (scene.background) { ctx.fillStyle = scene.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    for (const node of scene.nodes) {
      ctx.save();
      if (node.kind === "text") {
        ctx.font = `${node.weight} ${node.size}px "${SHARE_FONTS[node.font]}"`;
        ctx.textAlign = node.align === "middle" ? "center" : node.align === "end" ? "right" : "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = node.fill;
        ctx.fillText(node.value, node.x, node.y);
      } else if (node.kind === "rect") {
        ctx.fillStyle = node.fill;
        ctx.beginPath();
        const { x, y, width: w, height: h } = node, r = Math.min(node.radius, w / 2, h / 2);
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
      } else {
        const path = new Path2D(node.kind === "path" ? node.d : undefined);
        if (node.kind === "circle") path.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.fill !== "none") { ctx.fillStyle = node.fill; ctx.fill(path); }
        if (node.stroke !== "none") { ctx.strokeStyle = node.stroke; ctx.lineWidth = node.strokeWidth; ctx.stroke(path); }
      }
      ctx.restore();
    }
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the PNG. Please try again.")), "image/png"));
  } finally {
    // Release the large backing buffer, especially on iOS.
    canvas.width = 1;
    canvas.height = 1;
  }
}

export function shareFilename(spec: ShareSpec) {
  const data = spec.data;
  const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80);
  if (data.type === "weekly" && data.week) return `sprintly-week-${data.week.id.replace(/[^A-Za-z0-9-]/g, "")}.png`;
  if (data.type === "record" && data.record) return `sprintly-${slug(data.record.key)}-pr.png`;
  if (data.type === "achievement" && data.achievement) return `sprintly-${slug(data.achievement.id)}.png`;
  return `sprintly-${data.type}-${slug(data.date)}.png`;
}

export function downloadShareFile(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Mobile browsers may consume the URL after the click handler returns.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled" | "ready";
type ShareEnvironment = {
  navigator: Partial<Pick<Navigator, "share" | "canShare">> & { userActivation?: { isActive: boolean } };
  download: (file: File) => void;
};

/** Must be called by a click. No image, data or URL is published automatically. */
export async function shareOrDownload(file: File, title: string, justRendered = false, environment: ShareEnvironment = { navigator, download: downloadShareFile }): Promise<ShareOutcome> {
  const nav = environment.navigator;
  let supported = false;
  try { supported = Boolean(nav.share && nav.canShare?.({ files: [file] })); } catch { /* unsupported file capability */ }
  if (!supported || !nav.share) { environment.download(file); return "downloaded"; }
  if (justRendered && nav.userActivation?.isActive === false) return "ready";
  try {
    await nav.share({ files: [file], title });
    return "shared";
  } catch (error) {
    const name = error && typeof error === "object" && "name" in error ? error.name : "";
    if (name === "AbortError") return "cancelled";
    if (name === "NotAllowedError" && justRendered) return "ready";
    // Policy-blocked or unavailable targets still have a reliable PNG path.
    environment.download(file);
    return "downloaded";
  }
}
