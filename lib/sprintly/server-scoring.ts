import type { SprintlySession } from "@/lib/sprintly/contract";

export type ServerSessionMetrics = {
  focusScore: number;
  testingDisciplineScore: number;
  recoveryScore: number;
  consistencyScore: number;
  aiBalanceScore: number;
  devScore: number;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number, decimals = 3) => Number(value.toFixed(decimals));

export function computeServerSessionMetrics(session: SprintlySession): ServerSessionMetrics {
  const durationHours = session.activeDurationSeconds / 3600;
  const commandTotal = Math.max(1, session.terminal.totalCommands);
  const testActivity = session.terminal.test + session.terminal.build + session.terminal.lint;
  const testRatio = (testActivity / commandTotal) * 100;

  const focusScore = clamp(
    32 +
      session.coding.manualPercent * 0.34 +
      Math.min(16, durationHours * 18) +
      Math.min(12, session.activity.filesTouched / 25) -
      session.coding.unknownBulkEditPercent * 0.12,
  );
  const testingDisciplineScore = clamp(28 + testRatio * 0.62 + Math.min(18, session.activity.saves / 100));
  const recoveryScore = clamp(session.reliability.recoveryRate);
  const consistencyScore = clamp(28 + Math.min(52, durationHours * 30) + Math.min(20, session.activity.edits / 500));
  const aiBalanceScore = clamp(100 - Math.abs(session.coding.aiAssistedPercent - 25) * 1.15);
  const devScore = clamp(
    focusScore * 0.3 +
      testingDisciplineScore * 0.2 +
      recoveryScore * 0.15 +
      consistencyScore * 0.2 +
      aiBalanceScore * 0.15,
    0,
    100,
  ) * 10;

  return {
    focusScore: round(focusScore),
    testingDisciplineScore: round(testingDisciplineScore),
    recoveryScore: round(recoveryScore),
    consistencyScore: round(consistencyScore),
    aiBalanceScore: round(aiBalanceScore),
    devScore: Math.round(devScore),
  };
}

export function zeroTerminal() {
  return {
    totalCommands: 0,
    build: 0,
    test: 0,
    git: 0,
    packageManager: 0,
    devServer: 0,
    lint: 0,
    other: 0,
  };
}

export function zeroAi() {
  return {
    claudeCodePrompts: 0,
    codexPrompts: 0,
    copilotPrompts: 0,
    tokenTotals: { claude: 0, codex: 0, copilot: 0 },
  };
}

