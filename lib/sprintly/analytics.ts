import type { SprintlySession } from "./contract";

export type DateRange = "today" | "week" | "month" | "all" | "custom";
export type CustomRange = { from: string; to: string };

export type SessionAggregate = {
  sessionCount: number;
  activeDurationSeconds: number;
  coding: SprintlySession["coding"];
  activity: SprintlySession["activity"];
  terminal: SprintlySession["terminal"];
  ai: SprintlySession["ai"];
  reliability: SprintlySession["reliability"];
  scores: {
    focus: number;
    testingDiscipline: number;
    recovery: number;
    consistency: number;
    aiBalance: number;
    devScore: number;
  };
  archetype: string;
  traits: string[];
};

export type StreakStats = { current: number; longest: number; activeDays: string[] };

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
};

export type PersonalRecords = {
  longestSessionSeconds: number;
  bestFocus: number;
  bestRecovery: number;
  bestWeeklyDevScore: number;
  longestStreak: number;
  mostSessionsInWeek: number;
  mostTestsInSession: number;
  highestShippingActivity: number;
};

export type LeaderboardPacket = {
  schemaVersion: 1;
  devScoreVersion: "v1";
  week: string;
  region: string;
  sessions: number;
  activeMinutes: number;
  focusScore: number;
  recoveryScore: number;
  devScore: number;
  streak: number;
};

export type LeaderboardEntry = LeaderboardPacket & {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  country: string;
  region: string;
  city: string;
  friends: string[];
};

export type ShareField = "codingTime" | "archetype" | "codingMix" | "recovery" | "failures" | "tokenUsage" | "terminalActivity" | "devScore" | "streak";

export type SharePayload = {
  codingTime: string;
  archetype: string;
  codingMix: { manual: number; aiAssisted: number; automation: number };
  recovery: number;
  failures: number;
  tokenUsage: number;
  terminalActivity: number;
  devScore: number;
  streak: number;
};

const DAY_MS = 86_400_000;

const zeroAggregate = (): SessionAggregate => ({
  sessionCount: 0,
  activeDurationSeconds: 0,
  coding: { manualPercent: 0, aiAssistedPercent: 0, automationPercent: 0, unknownBulkEditPercent: 0 },
  activity: { edits: 0, saves: 0, filesTouched: 0, linesChangedEstimate: 0 },
  terminal: { totalCommands: 0, build: 0, test: 0, git: 0, packageManager: 0, devServer: 0, lint: 0, other: 0 },
  ai: { claudeCodePrompts: 0, codexPrompts: 0, copilotPrompts: 0, tokenTotals: { claude: 0, codex: 0, copilot: 0 } },
  reliability: { failures: 0, recoveredFailures: 0, recoveryRate: 100 },
  scores: { focus: 0, testingDiscipline: 0, recovery: 100, consistency: 0, aiBalance: 0, devScore: 0 },
  archetype: "New Builder",
  traits: [],
});

const average = (values: number[]) => values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
const pad2 = (value: number) => String(value).padStart(2, "0");

type ZonedClock = { year: number; month: number; day: number; hour: number; weekday: number };

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const clockFormatters = new Map<string, Intl.DateTimeFormat>();

function clockFormatter(zone: string) {
  let formatter = clockFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", weekday: "short", hourCycle: "h23" });
    clockFormatters.set(zone, formatter);
  }
  return formatter;
}

function resolveInstant(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export function zonedClock(value: string | Date, timeZone?: string): ZonedClock {
  const date = resolveInstant(value);
  const requested = timeZone || "UTC";
  let parts: Array<Intl.DateTimeFormatPart>;
  try {
    parts = clockFormatter(requested).formatToParts(date);
  } catch {
    parts = clockFormatter("UTC").formatToParts(date);
  }
  const lookup = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(lookup("year")),
    month: Number(lookup("month")),
    day: Number(lookup("day")),
    hour: Number(lookup("hour")) % 24,
    weekday: WEEKDAY_INDEX[lookup("weekday")] ?? date.getUTCDay(),
  };
}

export function dateKey(value: string | Date, timeZone?: string) {
  const clock = zonedClock(value, timeZone);
  return `${clock.year}-${pad2(clock.month)}-${pad2(clock.day)}`;
}

const utcDayKey = (instant: number) => dateKey(new Date(instant), "UTC");

export function formatDuration(seconds: number) {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes.toString().padStart(2, "0")}m` : `${minutes}m`;
}

function largestRemainder(values: number[], total = 100): number[] {
  const rawTotal = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(rawTotal) || rawTotal <= 0) return values.map(() => 0);
  const exact = values.map((value) => (value / rawTotal) * total);
  const result = exact.map((value) => Math.floor(value));
  let remaining = total - result.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let cursor = 0; cursor < order.length && remaining > 0; cursor += 1) {
    result[order[cursor].index] += 1;
    remaining -= 1;
  }
  return result;
}

export function aggregateSessions(sessions: SprintlySession[]): SessionAggregate {
  if (!sessions.length) return zeroAggregate();
  const total = zeroAggregate();
  const archetypes = new Map<string, number>();
  const traits = new Map<string, number>();
  const scores = { focus: [], testingDiscipline: [], recovery: [], consistency: [], aiBalance: [], devScore: [] } as Record<keyof SessionAggregate["scores"], number[]>;
  const weightedCoding = { manualPercent: 0, aiAssistedPercent: 0, automationPercent: 0, unknownBulkEditPercent: 0 };
  let weightTotal = 0;
  const codingKeys = ["manualPercent", "aiAssistedPercent", "automationPercent", "unknownBulkEditPercent"] as Array<keyof SessionAggregate["coding"]>;

  for (const session of sessions) {
    total.sessionCount += 1;
    total.activeDurationSeconds += session.activeDurationSeconds;
    total.activity.edits += session.activity.edits;
    total.activity.saves += session.activity.saves;
    total.activity.filesTouched += session.activity.filesTouched;
    total.activity.linesChangedEstimate += session.activity.linesChangedEstimate;
    for (const key of Object.keys(total.terminal) as Array<keyof SessionAggregate["terminal"]>) total.terminal[key] += session.terminal[key];
    total.ai.claudeCodePrompts += session.ai.claudeCodePrompts;
    total.ai.codexPrompts += session.ai.codexPrompts;
    total.ai.copilotPrompts += session.ai.copilotPrompts;
    total.ai.tokenTotals.claude += session.ai.tokenTotals.claude;
    total.ai.tokenTotals.codex += session.ai.tokenTotals.codex;
    total.ai.tokenTotals.copilot += session.ai.tokenTotals.copilot;
    total.reliability.failures += session.reliability.failures;
    total.reliability.recoveredFailures += session.reliability.recoveredFailures;
    const weight = Math.max(1, session.activeDurationSeconds);
    weightTotal += weight;
    for (const key of codingKeys) weightedCoding[key] += session.coding[key] * weight;
    for (const key of Object.keys(scores) as Array<keyof SessionAggregate["scores"]>) scores[key].push(session.scores[key]);
    archetypes.set(session.archetype.primary, (archetypes.get(session.archetype.primary) ?? 0) + session.activeDurationSeconds);
    for (const trait of session.archetype.traits) traits.set(trait, (traits.get(trait) ?? 0) + 1);
  }

  const roundedMix = largestRemainder(codingKeys.map((key) => weightedCoding[key] / (weightTotal || 1)), 100);
  codingKeys.forEach((key, index) => { total.coding[key] = roundedMix[index]; });
  total.reliability.recoveryRate = total.reliability.failures ? Math.round((total.reliability.recoveredFailures / total.reliability.failures) * 100) : 100;
  for (const key of Object.keys(scores) as Array<keyof SessionAggregate["scores"]>) total.scores[key] = average(scores[key]);
  total.archetype = [...archetypes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "New Builder";
  total.traits = [...traits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([trait]) => trait);
  return total;
}

export function getWeekBounds(now = new Date(), timeZone?: string) {
  const clock = zonedClock(now, timeZone);
  const weekdayOffset = clock.weekday === 0 ? 6 : clock.weekday - 1;
  const weekStart = Date.UTC(clock.year, clock.month - 1, clock.day) - weekdayOffset * DAY_MS;
  return { from: utcDayKey(weekStart), to: utcDayKey(weekStart + 6 * DAY_MS) };
}

export function getMonthBounds(now = new Date(), timeZone?: string) {
  const clock = zonedClock(now, timeZone);
  return { from: `${clock.year}-${pad2(clock.month)}-01`, to: utcDayKey(Date.UTC(clock.year, clock.month, 0)) };
}

export function getPreviousPeriodBounds(range: "week" | "month", now = new Date(), timeZone?: string) {
  if (range === "week") {
    const bounds = getWeekBounds(now, timeZone);
    const weekStart = Date.parse(`${bounds.from}T00:00:00Z`);
    return { from: utcDayKey(weekStart - 7 * DAY_MS), to: utcDayKey(weekStart - DAY_MS) };
  }
  const clock = zonedClock(now, timeZone);
  const thisMonthStart = Date.UTC(clock.year, clock.month - 1, 1);
  const previous = new Date(thisMonthStart - DAY_MS);
  return { from: utcDayKey(Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth(), 1)), to: utcDayKey(thisMonthStart - DAY_MS) };
}

export function filterSessionsByRange(sessions: SprintlySession[], range: DateRange, now = new Date(), custom?: CustomRange, timeZone?: string) {
  if (range === "all") return [...sessions];
  const today = dateKey(now, timeZone);
  let from = today;
  if (range === "week") from = getWeekBounds(now, timeZone).from;
  if (range === "month") { const clock = zonedClock(now, timeZone); from = `${clock.year}-${pad2(clock.month)}-01`; }
  if (range === "custom") {
    const start = custom?.from || "0000-01-01";
    const end = custom?.to || "9999-12-31";
    return sessions.filter((session) => {
      const key = dateKey(session.startedAt, timeZone);
      return key >= start && key <= end;
    });
  }
  return sessions.filter((session) => dateKey(session.startedAt, timeZone) >= from && dateKey(session.startedAt, timeZone) <= today);
}

export function getStreakStats(sessions: SprintlySession[], referenceDate = new Date(), timeZone?: string): StreakStats {
  const activeDays = [...new Set(sessions.filter((session) => session.activeDurationSeconds > 0).map((session) => dateKey(session.startedAt, timeZone)))].sort();
  if (!activeDays.length) return { current: 0, longest: 0, activeDays: [] };
  let longest = 1;
  let run = 1;
  for (let index = 1; index < activeDays.length; index += 1) {
    const previous = new Date(`${activeDays[index - 1]}T00:00:00Z`).getTime();
    const current = new Date(`${activeDays[index]}T00:00:00Z`).getTime();
    if (current - previous === DAY_MS) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }
  const reference = new Date(`${dateKey(referenceDate, timeZone)}T00:00:00Z`).getTime();
  const last = new Date(`${activeDays[activeDays.length - 1]}T00:00:00Z`).getTime();
  let current = 0;
  if (reference - last <= DAY_MS) {
    current = 1;
    for (let index = activeDays.length - 1; index > 0; index -= 1) {
      const previous = new Date(`${activeDays[index - 1]}T00:00:00Z`).getTime();
      const currentDay = new Date(`${activeDays[index]}T00:00:00Z`).getTime();
      if (currentDay - previous !== DAY_MS) break;
      current += 1;
    }
  }
  return { current, longest, activeDays };
}

export function getIsoWeek(value: string | Date, timeZone?: string) {
  const clock = zonedClock(value, timeZone);
  const date = new Date(Date.UTC(clock.year, clock.month - 1, clock.day));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / DAY_MS) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function computeAchievements(sessions: SprintlySession[], streaks = getStreakStats(sessions), timeZone?: string): Achievement[] {
  const aggregate = aggregateSessions(sessions);
  const tests = aggregate.terminal.test;
  const terminal = aggregate.terminal.totalCommands;
  const weekendSessions = sessions.filter((session) => zonedClock(session.startedAt, timeZone).weekday === 0 || zonedClock(session.startedAt, timeZone).weekday === 6).length;
  const nightSessions = sessions.filter((session) => zonedClock(session.startedAt, timeZone).hour >= 21).length;
  const earlySessions = sessions.filter((session) => zonedClock(session.startedAt, timeZone).hour < 8).length;
  const recovered = aggregate.reliability.recoveredFailures;
  const aiShare = aggregate.coding.aiAssistedPercent;
  const hasRecord = sessions.length > 0;
  const definitions: Array<Omit<Achievement, "unlocked" | "progress"> & { value: number }> = [
    { id: "first-sprint", title: "First Sprint", description: "Import or complete your first session.", icon: "spark", value: sessions.length, target: 1 },
    { id: "seven-day-streak", title: "7 Day Streak", description: "Show up for seven active days in a row.", icon: "flame", value: streaks.longest, target: 7 },
    { id: "bug-survivor", title: "Bug Survivor", description: "Recover from three recorded failures.", icon: "shield", value: recovered, target: 3 },
    { id: "hundred-sessions", title: "100 Sessions", description: "Build a century of deliberate sessions.", icon: "layers", value: sessions.length, target: 100 },
    { id: "test-monk", title: "Test Monk", description: "Run ten test commands in your record.", icon: "check", value: tests, target: 10 },
    { id: "terminal-warrior", title: "Terminal Warrior", description: "Log twenty terminal commands.", icon: "terminal", value: terminal, target: 20 },
    { id: "weekend-warrior", title: "Weekend Warrior", description: "Code on two weekend sessions.", icon: "sun", value: weekendSessions, target: 2 },
    { id: "night-owl", title: "Night Owl", description: "Complete three late sessions.", icon: "moon", value: nightSessions, target: 3 },
    { id: "early-builder", title: "Early Builder", description: "Start three sessions before 08:00 in your timezone.", icon: "sunrise", value: earlySessions, target: 3 },
    { id: "recovery-beast", title: "Recovery Beast", description: "Recover at least 90% of recorded failures overall.", icon: "heart", value: aggregate.reliability.failures > 0 ? aggregate.reliability.recoveryRate : 0, target: 90 },
    { id: "vibe-lord", title: "Vibe Lord", description: "Use AI assistance thoughtfully across a record.", icon: "wand", value: aiShare, target: 45 },
  ];
  return definitions.map(({ value, target, ...achievement }) => ({
    ...achievement,
    unlocked: hasRecord && value >= target,
    progress: Math.min(100, Math.round((value / target) * 100)),
    target,
  }));
}

export function computePersonalRecords(sessions: SprintlySession[], streaks = getStreakStats(sessions), timeZone?: string): PersonalRecords {
  const byWeek = new Map<string, SprintlySession[]>();
  for (const session of sessions) {
    const week = getIsoWeek(session.startedAt, timeZone);
    byWeek.set(week, [...(byWeek.get(week) ?? []), session]);
  }
  const weeklyScores = [...byWeek.values()].map((week) => aggregateSessions(week).scores.devScore);
  const sessionCounts = [...byWeek.values()].map((week) => week.length);
  return {
    longestSessionSeconds: Math.max(0, ...sessions.map((session) => session.activeDurationSeconds)),
    bestFocus: Math.max(0, ...sessions.map((session) => session.scores.focus)),
    bestRecovery: Math.max(0, ...sessions.map((session) => session.reliability.recoveryRate)),
    bestWeeklyDevScore: Math.max(0, ...weeklyScores),
    longestStreak: streaks.longest,
    mostSessionsInWeek: Math.max(0, ...sessionCounts),
    mostTestsInSession: Math.max(0, ...sessions.map((session) => session.terminal.test)),
    highestShippingActivity: Math.max(0, ...sessions.map((session) => session.terminal.build + session.terminal.git)),
  };
}

export function computeCompositeDevScore(aggregate: SessionAggregate) {
  if (!aggregate.sessionCount) return 0;
  const score = aggregate.scores.focus * 0.25
    + aggregate.scores.consistency * 0.2
    + aggregate.scores.recovery * 0.2
    + aggregate.scores.testingDiscipline * 0.15
    + Math.min(100, aggregate.terminal.build * 5 + aggregate.terminal.git * 2) * 0.1
    + aggregate.scores.aiBalance * 0.1;
  return Math.round(score * 10);
}

export function sessionCompositeScore(session: SprintlySession) {
  return computeCompositeDevScore(aggregateSessions([session]));
}

export function buildLeaderboardPacket(sessions: SprintlySession[], region: string, referenceDate = new Date(), timeZone?: string): LeaderboardPacket {
  const aggregate = aggregateSessions(filterSessionsByRange(sessions, "week", referenceDate, undefined, timeZone));
  return {
    schemaVersion: 1,
    devScoreVersion: "v1",
    week: getIsoWeek(referenceDate, timeZone),
    region,
    sessions: aggregate.sessionCount,
    activeMinutes: Math.round(aggregate.activeDurationSeconds / 60),
    focusScore: aggregate.scores.focus,
    recoveryScore: aggregate.scores.recovery,
    devScore: computeCompositeDevScore(aggregate),
    streak: getStreakStats(sessions, referenceDate, timeZone).current,
  };
}

export function buildSharePayload(session: SprintlySession | undefined, aggregate: SessionAggregate, streak: number): SharePayload {
  const source = session ? aggregateSessions([session]) : aggregate;
  return {
    codingTime: formatDuration(source.activeDurationSeconds),
    archetype: source.archetype,
    codingMix: { manual: source.coding.manualPercent, aiAssisted: source.coding.aiAssistedPercent, automation: source.coding.automationPercent },
    recovery: source.reliability.recoveryRate,
    failures: source.reliability.failures,
    tokenUsage: source.ai.tokenTotals.claude + source.ai.tokenTotals.codex + source.ai.tokenTotals.copilot,
    terminalActivity: source.terminal.totalCommands,
    devScore: computeCompositeDevScore(source),
    streak,
  };
}

export const SHARE_FIELD_LABELS: Record<ShareField, string> = {
  codingTime: "Coding time",
  archetype: "Archetype",
  codingMix: "Coding mix",
  recovery: "Recovery",
  failures: "Failures",
  tokenUsage: "Token usage",
  terminalActivity: "Terminal activity",
  devScore: "Dev Score (v1)",
  streak: "Current streak",
};
