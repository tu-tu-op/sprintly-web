import { z } from "zod";

export const SPRINTLY_CONTRACT = "devstrava.session.v1" as const;
export const SPRINTLY_SCHEMA_VERSION = 1 as const;

const percentage = z.number().finite().min(0).max(100);
const count = z.number().int().min(0).max(10_000_000);
const promptCount = z.number().int().min(0).max(1_000_000);
const tokenCount = z.number().int().min(0).max(1_000_000_000_000);
const boundedScore = z.number().finite().min(0).max(100);

const codingSchema = z.object({
  manualPercent: percentage,
  aiAssistedPercent: percentage,
  automationPercent: percentage,
  unknownBulkEditPercent: percentage,
});

const activitySchema = z.object({
  edits: count,
  saves: count,
  filesTouched: count,
  linesChangedEstimate: count,
});

const terminalSchema = z.object({
  totalCommands: count,
  build: count,
  test: count,
  git: count,
  packageManager: count,
  devServer: count,
  lint: count,
  other: count,
});

const aiSchema = z.object({
  claudeCodePrompts: promptCount,
  codexPrompts: promptCount,
  copilotPrompts: promptCount,
  tokenTotals: z.object({
    claude: tokenCount,
    codex: tokenCount,
    copilot: tokenCount,
  }),
});

const reliabilitySchema = z.object({
  failures: count,
  recoveredFailures: count,
  recoveryRate: percentage,
});

const scoresSchema = z.object({
  focus: boundedScore,
  testingDiscipline: boundedScore,
  recovery: boundedScore,
  consistency: boundedScore,
  aiBalance: boundedScore,
  devScore: z.number().finite().min(0).max(1000),
});

const archetypeSchema = z.object({
  primary: z.string().trim().min(1).max(80),
  traits: z.array(z.string().trim().min(1).max(60)).max(8),
});

export const sprintlySessionSchema = z.object({
  contract: z.literal(SPRINTLY_CONTRACT).optional(),
  schemaVersion: z.literal(SPRINTLY_SCHEMA_VERSION),
  sessionId: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/, "Invalid session ID"),
  startedAt: z.string().trim().min(1).max(64),
  endedAt: z.string().trim().min(1).max(64),
  activeDurationSeconds: z.number().int().min(1).max(172_800),
  coding: codingSchema,
  activity: activitySchema,
  terminal: terminalSchema,
  ai: aiSchema,
  reliability: reliabilitySchema,
  scores: scoresSchema,
  archetype: archetypeSchema,
  signature: z.string().trim().min(1).max(512).optional(),
  publicKeyId: z.string().trim().min(1).max(128).optional(),
  submittedAt: z.string().trim().min(1).max(64).optional(),
}).superRefine((session, ctx) => {
  const started = Date.parse(session.startedAt);
  const ended = Date.parse(session.endedAt);
  if (!Number.isFinite(started)) {
    ctx.addIssue({ code: "custom", path: ["startedAt"], message: "startedAt must be a valid ISO timestamp" });
  }
  if (!Number.isFinite(ended)) {
    ctx.addIssue({ code: "custom", path: ["endedAt"], message: "endedAt must be a valid ISO timestamp" });
  }
  if (Number.isFinite(started) && Number.isFinite(ended)) {
    if (ended <= started) {
      ctx.addIssue({ code: "custom", path: ["endedAt"], message: "endedAt must be after startedAt" });
    } else if (session.activeDurationSeconds > Math.ceil((ended - started) / 1000) + 300) {
      ctx.addIssue({ code: "custom", path: ["activeDurationSeconds"], message: "active duration cannot exceed elapsed time" });
    }
  }

  const codingTotal = Object.values(session.coding).reduce((total, value) => total + value, 0);
  if (Math.abs(codingTotal - 100) > 0.11) {
    ctx.addIssue({ code: "custom", path: ["coding"], message: "coding percentages must add up to 100" });
  }

  const terminalTotal = Object.entries(session.terminal)
    .filter(([key]) => key !== "totalCommands")
    .reduce((total, [, value]) => total + value, 0);
  if (terminalTotal > session.terminal.totalCommands) {
    ctx.addIssue({ code: "custom", path: ["terminal", "totalCommands"], message: "totalCommands cannot be lower than its categories" });
  }
  if (session.reliability.recoveredFailures > session.reliability.failures) {
    ctx.addIssue({ code: "custom", path: ["reliability", "recoveredFailures"], message: "recoveredFailures cannot exceed failures" });
  }
  if (session.reliability.failures === 0 && session.reliability.recoveryRate !== 100) {
    ctx.addIssue({ code: "custom", path: ["reliability", "recoveryRate"], message: "a session without failures has a 100% recovery rate" });
  }
  if (session.reliability.failures > 0) {
    const calculated = (session.reliability.recoveredFailures / session.reliability.failures) * 100;
    if (Math.abs(calculated - session.reliability.recoveryRate) > 0.11) {
      ctx.addIssue({ code: "custom", path: ["reliability", "recoveryRate"], message: "recoveryRate must match recoveredFailures / failures" });
    }
  }
});

export type SprintlySession = z.infer<typeof sprintlySessionSchema>;

export type ImportIssue = {
  index: number;
  message: string;
  sessionId?: string;
};

export type ImportValidation = {
  ok: boolean;
  sessions: SprintlySession[];
  duplicates: Array<{ index: number; sessionId: string; reason: "file" | "already-imported" }>;
  issues: ImportIssue[];
  contract: typeof SPRINTLY_CONTRACT;
};

function formatZodIssue(issue: z.ZodIssue) {
  const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}

function extractRecords(payload: unknown): unknown[] | { error: string } {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return { error: "Import must be a JSON object or an array of sessions" };

  const root = payload as Record<string, unknown>;
  if ("schemaVersion" in root && root.schemaVersion !== SPRINTLY_SCHEMA_VERSION) {
    return { error: `Unsupported schema version: ${String(root.schemaVersion)}. Expected ${SPRINTLY_SCHEMA_CONTRACT_LABEL}` };
  }
  if ("contract" in root && root.contract !== SPRINTLY_CONTRACT) {
    return { error: `Unsupported contract: ${String(root.contract)}. Expected ${SPRINTLY_CONTRACT}` };
  }
  if (Array.isArray(root.sessions)) return root.sessions;
  return [payload];
}

const SPRINTLY_SCHEMA_CONTRACT_LABEL = SPRINTLY_CONTRACT;

export function validateSprintlyImport(payload: unknown, existingIds: ReadonlySet<string> = new Set()): ImportValidation {
  const extracted = extractRecords(payload);
  if ("error" in extracted) {
    return { ok: false, sessions: [], duplicates: [], issues: [{ index: -1, message: extracted.error }], contract: SPRINTLY_CONTRACT };
  }

  const sessions: SprintlySession[] = [];
  const duplicates: ImportValidation["duplicates"] = [];
  const issues: ImportIssue[] = [];
  const seen = new Set<string>();

  extracted.forEach((record, index) => {
    const parsed = sprintlySessionSchema.safeParse(record);
    if (!parsed.success) {
      const rawId = record && typeof record === "object" && "sessionId" in record ? String((record as Record<string, unknown>).sessionId) : undefined;
      issues.push({ index, message: parsed.error.issues.map(formatZodIssue).join("; "), sessionId: rawId });
      return;
    }
    const sessionId = parsed.data.sessionId;
    if (seen.has(sessionId)) {
      duplicates.push({ index, sessionId, reason: "file" });
      return;
    }
    seen.add(sessionId);
    if (existingIds.has(sessionId)) {
      duplicates.push({ index, sessionId, reason: "already-imported" });
      return;
    }
    sessions.push(parsed.data);
  });

  return { ok: sessions.length > 0 && issues.length === 0, sessions, duplicates, issues, contract: SPRINTLY_CONTRACT };
}

export function parseSprintlyImportText(text: string, existingIds: ReadonlySet<string> = new Set()) {
  if (text.length > 5_000_000) {
    return { ok: false, sessions: [], duplicates: [], issues: [{ index: -1, message: "Import is too large. Choose an export under 5 MB." }], contract: SPRINTLY_CONTRACT } satisfies ImportValidation;
  }
  try {
    return validateSprintlyImport(JSON.parse(text) as unknown, existingIds);
  } catch {
    return { ok: false, sessions: [], duplicates: [], issues: [{ index: -1, message: "The selected file is not valid JSON." }], contract: SPRINTLY_CONTRACT } satisfies ImportValidation;
  }
}

export function serializeSprintlyExport(sessions: SprintlySession[]) {
  return JSON.stringify({
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    sessions,
  }, null, 2);
}
