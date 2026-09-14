import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { DEMO_SESSIONS } from "../demo-data.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { deriveSessionShare, deriveShareSources } from "./derive-share-data.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { buildShareScene, renderShareSvg } from "./renderer.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { devprint } from "./devprint.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { palette } from "./scene.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { shareOrDownload, shareFilename } from "./export.ts";
import type { ShareSpec } from "./types";
const data = deriveSessionShare(DEMO_SESSIONS[0]);
const spec: ShareSpec = { version: 1, template: "session-hero", format: "portrait", theme: "graphite", data };

test("Devprint is deterministic and responds to mix, scores and duration", () => {
  const print = devprint(data, 500, 500, 250, palette("graphite"));
  assert.deepEqual(devprint(data, 500, 500, 250, palette("graphite")), print);
  assert.notDeepEqual(devprint({ ...data, scores: { ...data.scores!, focus: 0 } }, 500, 500, 250, palette("graphite")), print);
  assert.notDeepEqual(devprint({ ...data, activity: { sessions: 1, codingSeconds: 36000 } }, 500, 500, 250, palette("graphite")), print);
});

test("all templates build deterministic scenes, stickers have no background, text is escaped", () => {
  const sources = deriveShareSources(DEMO_SESSIONS, { now: new Date("2026-09-14"), timeZone: "UTC" });
  for (const template of ["session-hero", "minimal-stats", "stat-sticker", "personal-record", "week-in-code"] as const) {
    const sourceData = template === "personal-record" ? sources.find((s) => s.kind === "record")!.data : template === "week-in-code" ? sources.find((s) => s.kind === "weekly")!.data : data;
    for (const format of ["story", "portrait", "square"] as const) {
      const current = { ...spec, template, format, data: sourceData };
      const scene = buildShareScene(current);
      assert.deepEqual(buildShareScene(current), scene);
      assert.equal(scene.background === null, template === "stat-sticker");
      for (const node of scene.nodes) if (node.kind === "text") {
        assert.ok(node.x >= 0 && node.x <= scene.width);
        assert.ok(node.y >= node.size && node.y <= scene.height);
      }
    }
  }
  const svg = renderShareSvg({ ...spec, data: { ...data, archetype: '<script>alert("unsafe")</script>' } });
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;SCRIPT&gt;"));
});

test("native sharing uses the PNG file and cancellation never downloads", async () => {
  const file = new File(["PNG"], "sprintly-session.png", { type: "image/png" });
  let downloads = 0;
  let shared: ShareData | undefined;
  const environment = { navigator: { canShare: () => true, share: async (input: ShareData) => { shared = input; }, userActivation: { isActive: true } }, download: () => { downloads++; } };
  assert.equal(await shareOrDownload(file, "Session", false, environment), "shared");
  assert.deepEqual(shared, { files: [file], title: "Session" });
  environment.navigator.share = async () => { throw new DOMException("Cancelled", "AbortError"); };
  assert.equal(await shareOrDownload(file, "Session", false, environment), "cancelled");
  assert.equal(downloads, 0);
});

test("unsupported file sharing downloads and lost activation requests a fresh tap", async () => {
  const file = new File(["PNG"], "sprintly.png", { type: "image/png" });
  let downloads = 0, shares = 0;
  const environment = { navigator: { canShare: () => false, share: async () => { shares++; }, userActivation: { isActive: false } }, download: () => { downloads++; } };
  assert.equal(await shareOrDownload(file, "Session", true, environment), "downloaded");
  assert.equal(downloads, 1);
  environment.navigator.canShare = () => true;
  assert.equal(await shareOrDownload(file, "Session", true, environment), "ready");
  assert.equal(shares, 0);
  environment.navigator.userActivation.isActive = true;
  assert.equal(await shareOrDownload(file, "Session", false, environment), "shared");
  assert.equal(shares, 1);
  assert.match(shareFilename(spec), /^sprintly-session-\d{4}-\d{2}-\d{2}\.png$/);
});
