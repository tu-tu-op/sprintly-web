import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { DEMO_SESSIONS } from "./demo-data.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { aggregateSessions, computeAchievements, computeCompositeDevScore, filterSessionsByRange, getIsoWeek, getMonthBounds, getPreviousPeriodBounds, getStreakStats, getWeekBounds, sessionCompositeScore } from "./analytics.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { parseSprintlyImportText } from "./contract.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { sanitizeNextPath } from "./auth.ts";

test("accepts the v1 contract and skips an existing duplicate", () => {
  const payload = JSON.stringify({ contract: "devstrava.session.v1", schemaVersion: 1, sessions: [DEMO_SESSIONS[0]] });
  const result = parseSprintlyImportText(payload, new Set([DEMO_SESSIONS[0].sessionId]));
  assert.equal(result.sessions.length, 0);
  assert.equal(result.duplicates[0]?.reason, "already-imported");
  assert.equal(result.issues.length, 0);
});

test("rejects unsupported future schema versions", () => {
  const result = parseSprintlyImportText(JSON.stringify({ schemaVersion: 2, sessions: [] }));
  assert.equal(result.ok, false);
  assert.match(result.issues[0]?.message ?? "", /Unsupported schema version/);
});

test("rejects malformed percentages and timestamp ordering", () => {
  const malformed = { ...DEMO_SESSIONS[0], startedAt: "2026-08-15T11:00:00Z", endedAt: "2026-08-15T10:00:00Z", coding: { ...DEMO_SESSIONS[0].coding, manualPercent: 130 } };
  const result = parseSprintlyImportText(JSON.stringify(malformed));
  assert.equal(result.ok, false);
  assert.equal(result.sessions.length, 0);
  assert.ok(result.issues[0]?.message.includes("manualPercent") || result.issues[0]?.message.includes("endedAt"));
});

test("rejects timezone-less timestamps (B6)", () => {
  const naive = { ...DEMO_SESSIONS[0], startedAt: "2026-08-15T11:00:00" };
  const result = parseSprintlyImportText(JSON.stringify(naive));
  assert.equal(result.ok, false);
  assert.equal(result.sessions.length, 0);
  assert.match(result.issues[0]?.message ?? "", /RFC 3339/);
});

test("accepts offsets as well as Z timestamps (B6)", () => {
  const offset = { ...DEMO_SESSIONS[0], sessionId: "sess_offset_ok", startedAt: "2026-08-15T14:30:00+05:30", endedAt: "2026-08-15T16:12:00+05:30" };
  const result = parseSprintlyImportText(JSON.stringify(offset));
  assert.equal(result.issues.length, 0);
  assert.equal(result.sessions.length, 1);
});

test("reports unsupported fields instead of silently stripping them (B7)", () => {
  const extended = { ...DEMO_SESSIONS[0], experimentalMoodIndex: 42 };
  const result = parseSprintlyImportText(JSON.stringify(extended));
  assert.equal(result.ok, false);
  assert.equal(result.sessions.length, 0);
  assert.match(result.issues[0]?.message ?? "", /experimentalMoodIndex/);
});

test("enforces a per-import record ceiling (B15)", () => {
  const many = Array.from({ length: 2_100 }, (_, index) => ({ ...DEMO_SESSIONS[0], sessionId: `sess_bulk_${index}` }));
  const result = parseSprintlyImportText(JSON.stringify(many));
  assert.equal(result.ok, false);
  assert.equal(result.sessions.length, 0);
  assert.match(result.issues[0]?.message ?? "", /limit/i);
});

test("calculates streaks, aggregates, achievements, and a versioned score from real records", () => {
  const reference = new Date("2026-08-15T12:00:00Z");
  const streaks = getStreakStats(DEMO_SESSIONS, reference);
  const aggregate = aggregateSessions(DEMO_SESSIONS);
  const achievements = computeAchievements(DEMO_SESSIONS, streaks);
  assert.equal(streaks.current, 8);
  assert.equal(streaks.longest, 8);
  assert.equal(aggregate.sessionCount, 8);
  assert.equal(aggregate.coding.manualPercent + aggregate.coding.aiAssistedPercent + aggregate.coding.automationPercent + aggregate.coding.unknownBulkEditPercent, 100);
  assert.ok(computeCompositeDevScore(aggregate) > 0);
  assert.equal(achievements.find((achievement) => achievement.id === "seven-day-streak")?.unlocked, true);
  assert.equal(achievements.find((achievement) => achievement.id === "first-sprint")?.unlocked, true);
});

test("empty history produces a zero composite score and no unlocked achievements (B1)", () => {
  const aggregate = aggregateSessions([]);
  assert.equal(computeCompositeDevScore(aggregate), 0);
  const achievements = computeAchievements([], getStreakStats([]));
  assert.ok(achievements.length > 0);
  for (const achievement of achievements) {
    assert.equal(achievement.unlocked, false, `${achievement.id} must stay locked without sessions`);
    assert.equal(achievement.progress, 0);
  }
});

test("recovery achievement requires at least one recorded failure (B1)", () => {
  const failureFree = [{ ...DEMO_SESSIONS[0], sessionId: "sess_probe_clean", reliability: { failures: 0, recoveredFailures: 0, recoveryRate: 100 } }];
  const achievements = computeAchievements(failureFree);
  assert.equal(achievements.find((achievement) => achievement.id === "recovery-beast")?.unlocked, false);
});

test("coding mix is duration-weighted and always totals exactly 100 (B4)", () => {
  const base = DEMO_SESSIONS[0];
  const oneMinuteManual = { ...base, sessionId: "sess_mix_a", activeDurationSeconds: 60, coding: { manualPercent: 100, aiAssistedPercent: 0, automationPercent: 0, unknownBulkEditPercent: 0 } };
  const sixtyMinuteAi = { ...base, sessionId: "sess_mix_b", activeDurationSeconds: 3600, coding: { manualPercent: 0, aiAssistedPercent: 100, automationPercent: 0, unknownBulkEditPercent: 0 } };
  const aggregate = aggregateSessions([oneMinuteManual, sixtyMinuteAi]);
  const total = aggregate.coding.manualPercent + aggregate.coding.aiAssistedPercent + aggregate.coding.automationPercent + aggregate.coding.unknownBulkEditPercent;
  assert.equal(total, 100);
  assert.ok(aggregate.coding.aiAssistedPercent >= 97, `AI share should dominate, got ${aggregate.coding.aiAssistedPercent}`);
  assert.ok(aggregate.coding.manualPercent <= 3, `Manual share should be tiny, got ${aggregate.coding.manualPercent}`);
});

test("split sessions with repeating thirds still aggregate to exactly 100 (B4)", () => {
  const thirds = { ...DEMO_SESSIONS[0], sessionId: "sess_mix_c", coding: { manualPercent: 33.4, aiAssistedPercent: 33.3, automationPercent: 33.3, unknownBulkEditPercent: 0 } };
  const aggregate = aggregateSessions([thirds, thirds, thirds]);
  const total = aggregate.coding.manualPercent + aggregate.coding.aiAssistedPercent + aggregate.coding.automationPercent + aggregate.coding.unknownBulkEditPercent;
  assert.equal(total, 100);
});

test("calendar keys and range filters respect the user timezone (B2)", () => {
  // 2026-08-22T20:00:00Z is August 23 in Asia/Kolkata.
  const session = { ...DEMO_SESSIONS[0], sessionId: "sess_tz_probe", startedAt: "2026-08-22T20:00:00Z" };
  const reference = new Date("2026-08-23T05:00:00Z"); // Aug 23, 10:30 IST — same calendar day as the session there.
  const includedKolkata = filterSessionsByRange([session], "today", reference, undefined, "Asia/Kolkata");
  const includedUtc = filterSessionsByRange([session], "today", reference);
  assert.equal(includedKolkata.length, 1);
  assert.equal(includedUtc.length, 0);
  // 20:00Z on Aug 22 is already Aug 23 in Kolkata, so its ISO week must match Aug 23 noon UTC.
  assert.equal(getIsoWeek("2026-08-22T20:00:00Z", "Asia/Kolkata"), getIsoWeek(new Date("2026-08-23T12:00:00Z")));
});

test("week and month boundaries are timezone-aware (B2)", () => {
  const instant = new Date("2026-08-23T05:00:00Z"); // Sunday Aug 23 UTC, but Monday Aug 24 at 10:30 in Kolkata? No: Aug 23 10:30 IST is Sunday.
  const utcWeek = getWeekBounds(instant);
  const kolkataWeek = getWeekBounds(instant, "Asia/Kolkata");
  assert.equal(utcWeek.from, "2026-08-17");
  assert.equal(kolkataWeek.from, "2026-08-17");
  const month = getMonthBounds(new Date("2026-07-31T23:30:00Z"), "Asia/Kolkata");
  assert.equal(month.from, "2026-08-01");
  assert.equal(month.to, "2026-08-31");
});

test("previous period bounds follow the selected range (B3)", () => {
  const previousWeek = getPreviousPeriodBounds("week", new Date("2026-08-14T12:00:00Z"));
  assert.deepEqual(previousWeek, { from: "2026-08-03", to: "2026-08-09" });
  const previousMonth = getPreviousPeriodBounds("month", new Date("2026-08-14T12:00:00Z"));
  assert.deepEqual(previousMonth, { from: "2026-07-01", to: "2026-07-31" });
});

test("single-session composite scores stay reproducible", () => {
  const first = sessionCompositeScore(DEMO_SESSIONS[0]);
  const second = sessionCompositeScore(DEMO_SESSIONS[0]);
  assert.equal(first, second);
  assert.ok(first > 0);
});

test("post-sign-in redirect targets are restricted to internal paths (B10)", () => {
  assert.equal(sanitizeNextPath("/app/sessions"), "/app/sessions");
  assert.equal(sanitizeNextPath("/app/sessions?range=week"), "/app/sessions?range=week");
  assert.equal(sanitizeNextPath(null), "/app");
  assert.equal(sanitizeNextPath(undefined), "/app");
  assert.equal(sanitizeNextPath(""), "/app");
  assert.equal(sanitizeNextPath("https://evil.example/account"), "/app");
  assert.equal(sanitizeNextPath("//evil.example"), "/app");
  assert.equal(sanitizeNextPath("/\\evil.example"), "/app");
  assert.equal(sanitizeNextPath("javascript:alert(1)"), "/app");
  assert.equal(sanitizeNextPath("/javascript:alert(1)"), "/app");
  assert.equal(sanitizeNextPath("/app\r\nSet-Cookie: 1"), "/app");
});
