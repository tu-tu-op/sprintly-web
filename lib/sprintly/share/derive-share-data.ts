// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { aggregateSessions, computeAchievements, computeCompositeDevScore, dateKey, formatDuration, getIsoWeek, getStreakStats, getWeekBounds } from "../analytics.ts";
import type { SessionAggregate } from "../analytics";
import type { SprintlySession } from "../contract";
import type { StoredSession } from "../storage";
import type { ShareMediaData, SharePrivacy, ShareRecord, ShareSource, ShareSourceRequest } from "./types";

const PRIVATE: SharePrivacy = { showTerminalActivity: false, showTokenUsage: false };
const DAY = 86_400_000;
const integer = (value: number) => String(Math.round(value));
const metric = (key: string, label: string, value: string) => ({ key, label, value });

/** Remote mode never promotes local demo/import packets into account sources. */
export function accountShareSessions(stored: StoredSession[], mode: "local" | "remote") {
  return stored.filter((session) => mode === "local" || (session.source === "extension" && session.syncStatus === "synced"))
    .map((session) => session.record);
}

/** Explicit allowlist projection: do not spread sessions, scores or AI objects here. */
function aggregateMedia(aggregate: SessionAggregate, privacy: SharePrivacy) {
  const data: Pick<ShareMediaData, "activity" | "archetype" | "codingMix" | "scores" | "metrics" | "terminal" | "tokenCount"> = {
    activity: { sessions: aggregate.sessionCount, codingSeconds: aggregate.activeDurationSeconds },
    archetype: aggregate.archetype,
    codingMix: {
      manual: aggregate.coding.manualPercent,
      ai: aggregate.coding.aiAssistedPercent,
      automation: aggregate.coding.automationPercent,
      unknown: aggregate.coding.unknownBulkEditPercent,
    },
    scores: {
      focus: aggregate.scores.focus,
      recovery: aggregate.scores.recovery,
      consistency: aggregate.scores.consistency,
      testing: aggregate.scores.testingDiscipline,
      aiBalance: aggregate.scores.aiBalance,
      devScore: computeCompositeDevScore(aggregate),
    },
    metrics: [
      metric("focus", "Focus", integer(aggregate.scores.focus)),
      metric("recovery", "Recovery", integer(aggregate.scores.recovery)),
      metric("devScore", "Dev Score", integer(computeCompositeDevScore(aggregate))),
    ],
  };
  if (privacy.showTerminalActivity && privacy.includeTerminalActivity) {
    data.terminal = {
      build: aggregate.terminal.build, test: aggregate.terminal.test, git: aggregate.terminal.git,
      other: Math.max(0, aggregate.terminal.totalCommands - aggregate.terminal.build - aggregate.terminal.test - aggregate.terminal.git),
    };
    data.metrics.push(metric("terminal", "Terminal events", integer(aggregate.terminal.totalCommands)));
  }
  if (privacy.showTokenUsage && privacy.includeTokenUsage) {
    data.tokenCount = aggregate.ai.tokenTotals.claude + aggregate.ai.tokenTotals.codex + aggregate.ai.tokenTotals.copilot;
    data.metrics.push(metric("tokens", "AI tokens", integer(data.tokenCount)));
  }
  return data;
}

type RecordDefinition = { key: string; label: string; read: (session: SprintlySession) => number; format: (value: number) => string };
const RECORDS: RecordDefinition[] = [
  { key: "focus", label: "Focus", read: (s) => s.scores.focus, format: integer },
  { key: "duration", label: "Coding time", read: (s) => s.activeDurationSeconds, format: formatDuration },
  { key: "recovery", label: "Recovery rate", read: (s) => s.reliability.recoveryRate, format: (n) => `${integer(n)}%` },
  { key: "tests", label: "Tests in a session", read: (s) => s.terminal.test, format: integer },
];

function availableRecords(privacy: SharePrivacy) {
  return RECORDS.filter((record) => record.key !== "tests" || (privacy.showTerminalActivity && privacy.includeTerminalActivity));
}

export function deriveSessionShare(session: SprintlySession, options: {
  privacy?: SharePrivacy; timeZone?: string; previousSessions?: SprintlySession[];
} = {}): ShareMediaData {
  const { privacy = PRIVATE, timeZone = "UTC", previousSessions = [] } = options;
  const aggregate = aggregateSessions([session]);
  const date = dateKey(session.startedAt, timeZone);
  const previous = previousSessions.filter((item) => Date.parse(item.endedAt) <= Date.parse(session.startedAt) && item.sessionId !== session.sessionId);
  let record: ShareRecord | undefined;
  if (previous.length) {
    for (const definition of availableRecords(privacy)) {
      const best = previous.reduce((max, item) => Math.max(max, definition.read(item)), 0);
      if (definition.read(session) > best) {
        record = { key: definition.key, label: definition.label, value: definition.format(definition.read(session)), previous: definition.format(best), isNew: true };
        break;
      }
    }
  }
  return {
    ...aggregateMedia(aggregate, privacy),
    type: "session", title: "A session well spent", subtitle: date, date,
    primaryMetric: metric("duration", "Coding time", formatDuration(session.activeDurationSeconds)),
    ...(record ? { record } : {}),
    visualSeed: `${date}:${session.activeDurationSeconds}:${aggregate.coding.manualPercent}:${aggregate.scores.focus}`,
  };
}

/** Also accepts future persisted weekly aggregates without session-level records. */
export function deriveWeeklyShare(aggregate: SessionAggregate, week: NonNullable<ShareMediaData["week"]>, streak: number, privacy: SharePrivacy = PRIVATE): ShareMediaData {
  return {
    ...aggregateMedia(aggregate, privacy), type: "weekly", title: "My week in code",
    subtitle: `${week.from} — ${week.to}`, date: week.from, week, streak,
    primaryMetric: metric("duration", "Coding time", formatDuration(aggregate.activeDurationSeconds)),
    metrics: [metric("sessions", "Sessions", integer(aggregate.sessionCount)), metric("devScore", "Dev Score", integer(computeCompositeDevScore(aggregate))), metric("streak", "Day streak", integer(streak)), metric("focus", "Average focus", integer(aggregate.scores.focus)),
      ...aggregateMedia(aggregate, privacy).metrics.filter((item) => item.key === "terminal" || item.key === "tokens")],
    visualSeed: `${week.id}:${aggregate.activeDurationSeconds}:${aggregate.scores.focus}`,
  };
}

function source(data: ShareMediaData, id: string, group: ShareSource["group"], label: string, summary: string): ShareSource {
  return { id, kind: data.type, group, label, summary, data };
}

export function deriveShareSources(input: SprintlySession[], options: { now?: Date; timeZone?: string; privacy?: SharePrivacy } = {}): ShareSource[] {
  const { now = new Date(), timeZone = "UTC", privacy = PRIVATE } = options;
  const seen = new Set<string>();
  const sessions = input.filter((s) => Date.parse(s.endedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt) || a.sessionId.localeCompare(b.sessionId))
    .filter((s) => { if (seen.has(s.sessionId)) return false; seen.add(s.sessionId); return true; });
  if (!sessions.length) return [];
  const today = dateKey(now, timeZone);
  const yesterday = dateKey(new Date(Date.parse(`${today}T00:00:00Z`) - DAY), "UTC");
  const streaks = getStreakStats(sessions, now, timeZone);
  const results: ShareSource[] = sessions.map((session) => {
    const data = deriveSessionShare(session, { privacy, timeZone, previousSessions: sessions });
    const label = data.date === today ? "Today’s session" : data.date === yesterday ? "Yesterday’s session" : data.date;
    return { ...source(data, `session:${session.sessionId}`, "Recent sessions", label, `${data.primaryMetric.value} · Focus ${data.scores?.focus}`), sessionId: session.sessionId };
  });

  for (const definition of availableRecords(privacy)) {
    // Earliest strict maximum owns a record; ties never manufacture a new PR.
    const chronological = [...sessions].reverse();
    const best = chronological.reduce((winner, item) => definition.read(item) > definition.read(winner) ? item : winner);
    if (definition.read(best) <= 0) continue;
    const earlier = chronological.filter((s) => Date.parse(s.endedAt) <= Date.parse(best.startedAt) && s.sessionId !== best.sessionId);
    const previous = earlier.length ? earlier.reduce((max, s) => Math.max(max, definition.read(s)), 0) : undefined;
    const value = definition.format(definition.read(best));
    const isNew = best.sessionId === sessions[0].sessionId && previous !== undefined;
    const record = { key: definition.key, label: definition.label, value, ...(previous !== undefined ? { previous: definition.format(previous) } : {}), isNew };
    const data: ShareMediaData = { ...deriveSessionShare(best, { privacy, timeZone }), type: "record", title: "Personal record", primaryMetric: metric(definition.key, definition.label, value), record };
    results.push(source(data, `record:${definition.key}`, "Personal records", `${isNew ? "New " : "Best "}${definition.label.toLowerCase()}`, value));
  }

  const byWeek = new Map<string, SprintlySession[]>();
  for (const session of sessions) {
    const week = getIsoWeek(session.startedAt, timeZone);
    const bucket = byWeek.get(week) ?? [];
    bucket.push(session); byWeek.set(week, bucket);
  }
  const weeks = [...byWeek.entries()].sort(([a], [b]) => b.localeCompare(a));
  for (const [id, records] of weeks) {
    const bounds = getWeekBounds(new Date(records[0].startedAt), timeZone);
    const week = {
      id, ...bounds,
      days: Array.from({ length: 7 }, (_, index) => {
        const date = dateKey(new Date(Date.parse(`${bounds.from}T00:00:00Z`) + index * DAY), "UTC");
        return { date, label: ["M", "T", "W", "T", "F", "S", "S"][index], seconds: records.filter((s) => dateKey(s.startedAt, timeZone) === date).reduce((sum, s) => sum + s.activeDurationSeconds, 0) };
      }),
    };
    const currentWeek = id === getIsoWeek(now, timeZone);
    const noon = new Date(`${bounds.to}T12:00:00Z`);
    const calendarOffset = Date.parse(`${dateKey(noon, timeZone)}T00:00:00Z`) - Date.parse(`${bounds.to}T00:00:00Z`);
    const reference = currentWeek ? now : new Date(noon.getTime() - calendarOffset);
    const historical = sessions.filter((s) => dateKey(s.startedAt, timeZone) <= bounds.to);
    const streak = currentWeek ? streaks.current : getStreakStats(historical, reference, timeZone).current;
    const data = deriveWeeklyShare(aggregateSessions(records), week, streak, privacy);
    results.push(source(data, `weekly:${id}`, "Recaps", currentWeek ? "This week" : `Week ${id.slice(-2)} · ${id.slice(0, 4)}`, `${data.primaryMetric.value} · ${records.length} sessions`));
  }

  // Preserve the existing personal-record definition: average imported weekly Dev Score.
  const rankedWeeks = [...weeks].sort((a, b) => a[0].localeCompare(b[0])).map(([id, records]) => ({ id, score: aggregateSessions(records).scores.devScore }));
  const bestWeek = rankedWeeks.reduce((best, week) => week.score > best.score ? week : best);
  if (bestWeek.score > 0) {
    const recap = results.find((item) => item.id === `weekly:${bestWeek.id}`)!;
    const previousWeeks = rankedWeeks.filter((week) => week.id < bestWeek.id);
    const previous = previousWeeks.length ? integer(Math.max(...previousWeeks.map((week) => week.score))) : undefined;
    const record = { key: "weekly-dev-score", label: "Weekly Dev Score", value: integer(bestWeek.score), previous, isNew: false };
    results.push(source({ ...recap.data, type: "record", title: "Personal record", primaryMetric: metric(record.key, record.label, record.value), record }, "record:weekly-dev-score", "Personal records", "Best weekly Dev Score", record.value));
  }

  const aggregate = aggregateSessions(sessions);
  if (streaks.current > 0) {
    const data: ShareMediaData = { ...aggregateMedia(aggregate, privacy), type: "streak", title: "Keep showing up", subtitle: today, date: today, primaryMetric: metric("streak", "Day coding streak", integer(streaks.current)), streak: streaks.current, visualSeed: `streak:${today}:${streaks.current}` };
    results.push(source(data, "streak:current", "Milestones", `${streaks.current} day streak`, "One day at a time. It adds up."));
  }
  if (streaks.longest > 0) {
    const record = { key: "longest-streak", label: "Day coding streak", value: integer(streaks.longest), isNew: false };
    const data: ShareMediaData = { ...aggregateMedia(aggregate, privacy), type: "record", title: "Personal record", subtitle: "Available history", date: today, primaryMetric: metric(record.key, record.label, record.value), record, streak: streaks.longest, visualSeed: `longest-streak:${streaks.longest}` };
    results.push(source(data, "record:longest-streak", "Personal records", "Longest streak", `${streaks.longest} days`));
  }
  for (const achievement of computeAchievements(sessions, streaks, timeZone)) {
    if (!achievement.unlocked) continue;
    if (["test-monk", "terminal-warrior"].includes(achievement.id) && !(privacy.showTerminalActivity && privacy.includeTerminalActivity)) continue;
    const data: ShareMediaData = {
      ...aggregateMedia(aggregate, privacy), type: "achievement", title: "Achievement unlocked", subtitle: "Earned from your available history", date: today,
      primaryMetric: metric("achievement", "Achievement", achievement.title),
      achievement: { id: achievement.id, title: achievement.title, description: achievement.description },
      visualSeed: `achievement:${achievement.id}:${aggregate.activeDurationSeconds}`,
    };
    results.push({ ...source(data, `achievement:${achievement.id}`, "Milestones", achievement.title, achievement.description), achievementId: achievement.id });
  }
  return results;
}

/** Missing/deleted deep links stay missing; never silently share another source. */
export function resolveShareSource(sources: ShareSource[], request: ShareSourceRequest) {
  if (request.sourceId) return sources.find((item) => item.id === request.sourceId);
  if (request.kind === "session") return sources.find((item) => item.sessionId === request.sessionId);
  if (request.kind === "achievement") return sources.find((item) => item.achievementId === request.achievementId);
  if (request.kind === "weekly") return sources.find((item) => item.kind === "weekly");
  if (request.kind === "streak") return sources.find((item) => item.kind === "streak");
  return undefined;
}
