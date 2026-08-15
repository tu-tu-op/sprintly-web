import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { DEMO_SESSIONS } from "./demo-data.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { aggregateSessions, computeAchievements, computeCompositeDevScore, getStreakStats } from "./analytics.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { parseSprintlyImportText } from "./contract.ts";

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
