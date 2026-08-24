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

const panelMotion = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: .28 } };

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.section {...panelMotion} className={`panel ${className}`}>{children}</motion.section>;
}

function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "cyan" | "gray" }) {
  const colors = { violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]", green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]", amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/[.08] text-[#c2c2c2]", cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/[.08] text-[#c7c7c7]", gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${colors[tone]}`}>{children}</span>;
}

function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function avatarStyle(archetype: string, traits: string[]) {
  const seed = `${archetype}:${traits.join(":")}`;
  const palettes = ["from-[#f2f2f2] to-[#bdbdbd]", "from-[#9a9a9a] to-[#b7b7b7]", "from-[#d0d0d0] to-[#bdbdbd]", "from-[#d2d2d2] to-[#9a9a9a]"];
  return palettes[seed.length % palettes.length];
}

export function PublicProfilePage() {
  const params = useParams<{ handle?: string | string[] }>();
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const data = loadUserData(DEMO_USER.id);
  const [ready] = useState(true);
  if (!ready) return null;
  if (handle !== data.profile.handle || data.preferences.profileVisibility !== "public") return <main className="grid min-h-dvh place-items-center bg-[#090909] p-6 text-center"><div><p className="mono text-xs uppercase tracking-[.18em] text-[#f2f2f2]">Sprintly profile</p><h1 className="mt-4 text-2xl font-semibold">This profile is private.</h1><p className="mt-2 text-sm text-[#7d7d7d]">The developer has not opted into public profile statistics.</p><Link href="/sign-in" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold">Open Sprintly</Link></div></main>;
  const records = data.sessions.map((item) => item.record);
  const aggregate = aggregateSessions(records);
  const streaks = getStreakStats(records);
  const achievements = computeAchievements(records, streaks).filter((achievement) => achievement.unlocked);
  return <main className="noise min-h-dvh bg-[#090909] px-4 py-8 sm:px-8"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><Link href="/" className="text-sm font-semibold">sprintly</Link><Pill tone="green"><Globe2 className="size-3"/> Public profile</Pill></div><Panel className="mt-10 p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className={`grid size-24 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br ${avatarStyle(aggregate.archetype, aggregate.traits)} text-2xl font-semibold`}>{initials(data.profile.displayName)}</div><div><p className="text-2xl font-semibold">{data.profile.displayName}</p><p className="mt-1 text-sm text-[#8b8b8b]">@{data.profile.handle} · {data.profile.city}</p><p className="mt-4 text-sm text-[#bdbdbd]">{aggregate.archetype}</p></div></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Manual", `${aggregate.coding.manualPercent}%`], ["AI-assisted", `${aggregate.coding.aiAssistedPercent}%`], ["Focus", aggregate.scores.focus], ["Dev Score", buildLeaderboardPacket(records, data.profile.country).devScore], ["Recovery", `${aggregate.reliability.recoveryRate}%`], ["Streak", `${streaks.current} days`], ["Sessions", records.length], ["Achievements", achievements.length]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white/[.025] p-4"><p className="mono text-xl font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{String(label)}</p></div>)}</div><div className="mt-8 flex flex-wrap gap-2">{aggregate.traits.map((trait) => <Pill key={trait} tone="gray">{trait}</Pill>)}</div></Panel><p className="mt-5 text-center text-xs text-[#7d7d7d]">Public summary only · raw prompts, source code, terminal output, and complete history are private.</p></div></main>;
}
