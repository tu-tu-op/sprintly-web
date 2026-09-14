import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { DEMO_SESSIONS } from "../demo-data.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { accountShareSessions, deriveSessionShare, deriveShareSources, resolveShareSource } from "./derive-share-data.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { recommendShare, templatesFor } from "./recommend-share.ts";
// @ts-expect-error Node's strip-types runner resolves TypeScript extensions.
import { SHARE_FORMATS, resolveShareFormat } from "./templates.ts";
import type { SprintlySession } from "../contract";
import type { StoredSession } from "../storage";

const fixture: SprintlySession = {
  ...DEMO_SESSIONS[0], sessionId: "share-session", startedAt: "2026-09-14T09:00:00Z", endedAt: "2026-09-14T11:14:23Z", activeDurationSeconds: 8063,
  scores: { focus: 91, recovery: 88, consistency: 85, testingDiscipline: 80, aiBalance: 75, devScore: 841 },
  coding: { manualPercent: 61, aiAssistedPercent: 32, automationPercent: 7, unknownBulkEditPercent: 0 },
  archetype: { primary: "Focused Builder", traits: ["Focused"] },
};
const now = new Date("2026-09-14T15:00:00Z");
const before = { ...fixture, sessionId: "earlier-session", startedAt: "2026-09-13T09:00:00Z", endedAt: "2026-09-13T11:14:23Z" };
const stored = (source: StoredSession["source"], syncStatus: StoredSession["syncStatus"]): StoredSession => ({ record: fixture, source, syncStatus, importedAt: fixture.endedAt, verified: false });

test("session derivation preserves known duration, scores, mix and archetype", () => {
  const data = deriveSessionShare(fixture);
  assert.equal(data.primaryMetric.value, "2h 14m");
  assert.equal(data.activity?.codingSeconds, 8063);
  assert.equal(data.scores?.focus, 91);
  assert.equal(data.scores?.recovery, 88);
  assert.equal(data.archetype, "Focused Builder");
  assert.deepEqual(data.codingMix, { manual: 61, ai: 32, automation: 7, unknown: 0 });
  assert.deepEqual(deriveSessionShare(fixture), data);
});

test("recommendations select Hero, Record and Week from real source data", () => {
  assert.equal(recommendShare(deriveSessionShare(fixture)), "session-hero");
  const previous = { ...before, scores: { ...before.scores, focus: 90 } };
  const record = deriveSessionShare(fixture, { previousSessions: [previous] });
  assert.equal(recommendShare(record), "personal-record");
  assert.equal(record.record?.previous, "90");
  assert.equal(templatesFor(record)[0].id, "personal-record");
  const week = deriveShareSources([fixture], { now }).find((item) => item.kind === "weekly")!;
  assert.equal(recommendShare(week.data), "week-in-code");
});

test("ties, first sessions and overlapping sessions never fabricate a PR", () => {
  assert.equal(deriveSessionShare(fixture, { previousSessions: [before] }).record, undefined);
  assert.equal(deriveSessionShare(fixture).record, undefined);
  const overlapping = { ...before, endedAt: fixture.endedAt, scores: { ...before.scores, focus: 10 } };
  assert.equal(deriveSessionShare(fixture, { previousSessions: [overlapping] }).record, undefined);
});

test("the share projection rejects unexpected private fields by construction", () => {
  const forbidden = ["sourceCode", "promptText", "terminalCommand", "terminalOutput", "filename", "secret", "environment", "signature", "publicKeyId", "sessionId"];
  const poisoned = { ...fixture, ...Object.fromEntries(forbidden.filter((key) => key !== "sessionId").map((key) => [key, "PRIVATE_SENTINEL"])) } as SprintlySession;
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) { assert.ok(!forbidden.includes(key), key); walk(entry); }
  };
  for (const source of deriveShareSources([poisoned], { now })) {
    walk(source.data);
    assert.ok(!JSON.stringify(source.data).includes("PRIVATE_SENTINEL"));
  }
});

test("terminal and token aggregates require account permission AND studio opt-in", () => {
  for (const show of [false, true]) for (const include of [false, true]) {
    const privacy = { showTokenUsage: show, showTerminalActivity: show, includeTokenUsage: include, includeTerminalActivity: include };
    const data = deriveSessionShare(fixture, { privacy });
    assert.equal(data.tokenCount !== undefined, show && include);
    assert.equal(data.terminal !== undefined, show && include);
    const sources = deriveShareSources([fixture], { now, privacy });
    assert.equal(sources.some((s) => s.id === "record:tests"), show && include);
    if (!show || !include) for (const item of sources) {
      assert.equal(item.data.terminal, undefined);
      assert.equal(item.data.tokenCount, undefined);
      assert.ok(!["achievement:test-monk", "achievement:terminal-warrior"].includes(item.id));
    }
  }
});

test("unknown coding proportions remain unknown", () => {
  const data = deriveSessionShare({ ...fixture, coding: { manualPercent: 50, aiAssistedPercent: 30, automationPercent: 5, unknownBulkEditPercent: 15 } });
  assert.deepEqual(data.codingMix, { manual: 50, ai: 30, automation: 5, unknown: 15 });
});

test("poster dimensions and sticker bounds are exact", () => {
  for (const [id, dimensions] of Object.entries({ story: [1080, 1920], portrait: [1080, 1350], square: [1080, 1080] })) {
    const format = SHARE_FORMATS[id as keyof typeof SHARE_FORMATS];
    assert.deepEqual([format.width, format.height], dimensions);
  }
  assert.equal(resolveShareFormat("stat-sticker", "story"), "sticker");
  assert.equal(resolveShareFormat("session-hero", "sticker"), "portrait");
  assert.ok(SHARE_FORMATS.sticker.height < 1080);
});

test("empty, future and unavailable sources do not silently select unrelated data", () => {
  assert.deepEqual(deriveShareSources([], { now }), []);
  assert.deepEqual(deriveShareSources([fixture], { now: new Date("2026-09-01") }), []);
  const sources = deriveShareSources([fixture], { now });
  assert.equal(resolveShareSource(sources, { kind: "session", sessionId: "deleted" }), undefined);
  assert.equal(resolveShareSource(sources, { kind: "achievement", achievementId: "locked" }), undefined);
  assert.equal(resolveShareSource(sources, { kind: "session", sessionId: fixture.sessionId })?.data.type, "session");
});

test("remote sources are synchronized account records; local mode retains imports", () => {
  const records = [stored("demo", "local"), stored("imported", "local"), stored("extension", "synced"), stored("extension", "pending")];
  assert.equal(accountShareSessions(records, "local").length, 4);
  assert.deepEqual(accountShareSessions(records, "remote"), [fixture]);
  assert.deepEqual(accountShareSessions([stored("demo", "local")], "remote"), []);
});

test("weekly bars use account timezone and show real zero days", () => {
  const boundary = { ...fixture, startedAt: "2026-09-13T23:00:00Z", endedAt: "2026-09-14T01:14:23Z" };
  const week = deriveShareSources([boundary], { now, timeZone: "Asia/Kolkata" }).find((item) => item.kind === "weekly")!.data;
  assert.equal(week.week?.id, "2026-W38");
  assert.equal(week.week?.days.length, 7);
  assert.deepEqual(week.week?.days.map((day) => day.seconds), [8063, 0, 0, 0, 0, 0, 0]);
  assert.equal(week.activity?.sessions, 1);
  assert.equal(week.streak, 1);
});

test("source order is stable, duplicates removed and locked achievements omitted", () => {
  const sources = deriveShareSources([fixture, before], { now });
  assert.deepEqual(deriveShareSources([before, fixture], { now }), sources);
  assert.deepEqual(deriveShareSources([fixture, before, fixture], { now }), sources);
  assert.ok(sources.some((item) => item.id === "achievement:first-sprint"));
  assert.ok(!sources.some((item) => item.id === "achievement:hundred-sessions"));
  assert.ok(sources.some((item) => item.kind === "streak"));
});

test("historical recap streak is evaluated at that week's end", () => {
  const old = { ...fixture, sessionId: "historical-session", startedAt: "2026-09-06T09:00:00Z", endedAt: "2026-09-06T11:14:23Z" };
  assert.equal(deriveShareSources([old, fixture], { now }).find((s) => s.id === "weekly:2026-W36")?.data.streak, 1);
});
