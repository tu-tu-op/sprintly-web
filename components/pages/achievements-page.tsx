"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  Code2, Download, Eye, EyeOff, FileCode2, FileJson, FileUp, Flame, Globe2, HardDrive, HeartPulse,
  LockKeyhole, LogOut, Medal, Moon,
  Radar, RefreshCw, Rocket, ShieldCheck, Sparkles, Terminal, Timer, Trophy, Upload,
  UserRound, X, Zap,
} from "lucide-react";
import {
  aggregateSessions, buildLeaderboardPacket, buildSharePayload, computeAchievements, computeCompositeDevScore,
  computePersonalRecords, dateKey, filterSessionsByRange, formatDuration, getPreviousPeriodBounds, getStreakStats,
  sessionCompositeScore, SHARE_FIELD_LABELS, zonedClock,
  type Achievement, type DateRange, type LeaderboardEntry, type ShareField,
} from "@/lib/sprintly/analytics";
import { isSupportedImportFileSize, MAX_IMPORT_FILE_BYTES, parseSprintlyImportText, SPRINTLY_CONTRACT, serializeSprintlyExport, type SprintlySession, type ImportValidation } from "@/lib/sprintly/contract";
import { DEMO_USER } from "@/lib/sprintly/demo-data";
import { clearAuthSession } from "@/lib/sprintly/auth";
import { downloadTextFile, DEFAULT_TIME_ZONE, loadUserData, type ShareSnapshot, type SyncPreference } from "@/lib/sprintly/storage";
import { useSprintly } from "@/components/sprintly-provider";

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#f2f2f2]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b8b8b]">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>;
}

function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "cyan" | "gray" }) {
  const colors = { violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]", green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]", amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/[.08] text-[#c2c2c2]", cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/[.08] text-[#c7c7c7]", gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${colors[tone]}`}>{children}</span>;
}

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function Progress({ value, color = "#f2f2f2" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

const panelMotion = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: .28 } };

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.section {...panelMotion} className={`panel ${className}`}>{children}</motion.section>;
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.unlocked ? CheckCircle2 : achievement.icon === "flame" ? Flame : achievement.icon === "moon" ? Moon : achievement.icon === "terminal" ? Terminal : achievement.icon === "heart" ? HeartPulse : Medal;
  return <Panel className={`p-5 ${achievement.unlocked ? "border-[#9a9a9a]/20" : "opacity-75"}`}><div className="flex items-start justify-between"><div className={`grid size-11 place-items-center rounded-full ${achievement.unlocked ? "bg-[#9a9a9a]/10 text-[#9a9a9a]" : "bg-white/[.04] text-[#6c6c6c]"}`}><Icon className="size-5"/></div>{achievement.unlocked && <Pill tone="amber">Unlocked</Pill>}</div><h2 className="mt-6 text-sm font-semibold">{achievement.title}</h2><p className="mt-2 min-h-10 text-xs leading-5 text-[#838383]">{achievement.description}</p><div className="mt-5"><div className="mb-2 flex justify-between text-[10px] text-[#7a7a7a]"><span>{achievement.progress}% complete</span><span>{achievement.unlocked ? "Done" : `${achievement.target} target`}</span></div><Progress value={achievement.progress} color={achievement.unlocked ? "#9a9a9a" : "#5c5c5c"}/></div></Panel>;
}

export function AchievementsPage() {
  const { sessions, preferences } = useSprintly();
  const records = recordsOf(sessions);
  const streaks = getStreakStats(records, new Date(), preferences.timeZone);
  const achievements = computeAchievements(records, streaks, preferences.timeZone);
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  return <div><PageHeader eyebrow="Progress · earned from real sessions" title="Achievements with receipts." description="Every badge below is calculated from validated activity. There is no fake progress bar and no automatic credit for unimported work." action={<Pill tone="amber"><Medal className="size-3"/> {unlocked}/{achievements.length} unlocked</Pill>}/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievements.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement}/>)}</div></div>;
}
