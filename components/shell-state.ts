"use client";

import { useMemo } from "react";
import { computeAchievements, getStreakStats } from "@/lib/sprintly/analytics";
import type { SyncPreference } from "@/lib/sprintly/storage";
import { useSprintly } from "./sprintly-provider";

export const SYNC_PREFERENCE_LABELS: Record<SyncPreference, string> = {
  never: "Sync off · local only",
  selected: "Sync · selected sessions",
  completed: "Sync · completed sessions",
  leaderboard: "Leaderboard stats only",
};

export type ShellNotification = {
  id: string;
  kind: "streak" | "achievement" | "storage";
  title: string;
  description: string;
};

export function initialsOf(displayName: string) {
  return displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

// Derives every identity, sync, and notification signal both shells show
// from the authenticated local record instead of hardcoded placeholders.
export function useShellState() {
  const { sessions, preferences, profile } = useSprintly();
  const records = useMemo(() => sessions.map((session) => session.record), [sessions]);
  const streaks = useMemo(() => getStreakStats(records), [records]);
  const unlockedAchievements = useMemo(() => computeAchievements(records, streaks).filter((achievement) => achievement.unlocked).length, [records, streaks]);

  const notifications = useMemo<ShellNotification[]>(() => [
    {
      id: "streak",
      kind: "streak",
      title: streaks.current > 0 ? `${streaks.current}-day streak active` : "No active streak",
      description: streaks.current > 0 ? "Computed from your imported sessions." : "Import a session to start one.",
    },
    {
      id: "achievements",
      kind: "achievement",
      title: unlockedAchievements > 0 ? `${unlockedAchievements} achievement${unlockedAchievements === 1 ? "" : "s"} unlocked` : "No achievements yet",
      description: "Recomputed deterministically from your record.",
    },
    {
      id: "storage",
      kind: "storage",
      title: "Records stay on this device",
      description: `${sessions.length} session${sessions.length === 1 ? "" : "s"} stored in this browser's local demo store.`,
    },
  ], [sessions.length, streaks.current, unlockedAchievements]);
  return {
    profile,
    preferences,
    displayName: profile.displayName,
    initials: initialsOf(profile.displayName),
    handle: profile.handle,
    location: `${profile.city}${profile.region ? ` · ${profile.region}` : ""}`,
    sessionsCount: sessions.length,
    streakCurrent: streaks.current,
    unlockedAchievements,
    syncLabel: SYNC_PREFERENCE_LABELS[preferences.syncPreference],
    notifications,
  };
}
