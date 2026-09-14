/** Versioned, aggregate-only rendering contract. Never add a raw session here. */
export type ShareKind = "session" | "record" | "weekly" | "streak" | "achievement";
export type ShareTemplate = "session-hero" | "minimal-stats" | "stat-sticker" | "personal-record" | "week-in-code";
export type ShareFormat = "story" | "portrait" | "square" | "sticker";
export type ShareTheme = "graphite" | "paper";
export type ShareMetric = { key: string; label: string; value: string };
export type ShareRecord = {
  key: string;
  label: string;
  value: string;
  previous?: string;
  isNew: boolean;
};

export type ShareMediaData = {
  type: ShareKind;
  title: string;
  subtitle: string;
  date: string;
  primaryMetric: ShareMetric;
  metrics: ShareMetric[];
  archetype?: string;
  codingMix?: { manual: number; ai: number; automation: number; unknown: number };
  scores?: { focus: number; recovery: number; consistency: number; testing: number; aiBalance: number; devScore: number };
  streak?: number;
  activity?: { sessions: number; codingSeconds: number };
  week?: { id: string; from: string; to: string; days: Array<{ date: string; label: string; seconds: number }> };
  record?: ShareRecord;
  achievement?: { id: string; title: string; description: string };
  /** Only populated after both account preference and explicit studio opt-in. */
  terminal?: { build: number; test: number; git: number; other: number };
  tokenCount?: number;
  visualSeed: string;
};

export type ShareSpec = {
  version: 1;
  template: ShareTemplate;
  format: ShareFormat;
  theme: ShareTheme;
  data: ShareMediaData;
};

export type ShareSource = {
  id: string;
  kind: ShareKind;
  group: "Recent sessions" | "Personal records" | "Recaps" | "Milestones";
  label: string;
  summary: string;
  sessionId?: string;
  achievementId?: string;
  data: ShareMediaData;
};

export type SharePrivacy = {
  showTokenUsage: boolean;
  showTerminalActivity: boolean;
  includeTokenUsage?: boolean;
  includeTerminalActivity?: boolean;
};

export type ShareSourceRequest = { kind: string | null; sessionId?: string | null; achievementId?: string | null; sourceId?: string | null };
