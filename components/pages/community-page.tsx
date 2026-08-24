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

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#f2f2f2]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b8b8b]">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>;
}

function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "cyan" | "gray" }) {
  const colors = { violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]", green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]", amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/[.08] text-[#c2c2c2]", cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/[.08] text-[#c7c7c7]", gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${colors[tone]}`}>{children}</span>;
}

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

const demoLeaders: LeaderboardEntry[] = [
  { id: "leader-1", name: "Theo Kern", handle: "@tkern", avatar: "TK", country: "US", city: "San Francisco", friends: ["demo-user"], ...{ schemaVersion: 1 as const, devScoreVersion: "v1" as const, week: "2026-W33", region: "California", sessions: 11, activeMinutes: 920, focusScore: 94, recoveryScore: 91, devScore: 936, streak: 24 } },
  { id: "leader-2", name: "Nina Shah", handle: "@ninacodes", avatar: "NS", country: "IN", city: "Pune", friends: ["demo-user"], ...{ schemaVersion: 1 as const, devScoreVersion: "v1" as const, week: "2026-W33", region: "Maharashtra", sessions: 9, activeMinutes: 812, focusScore: 90, recoveryScore: 94, devScore: 918, streak: 18 } },
  { id: "leader-3", name: "Luis Park", handle: "@luispark", avatar: "LP", country: "KR", city: "Seoul", friends: [], ...{ schemaVersion: 1 as const, devScoreVersion: "v1" as const, week: "2026-W33", region: "Seoul", sessions: 12, activeMinutes: 704, focusScore: 88, recoveryScore: 87, devScore: 884, streak: 31 } },
  { id: "leader-4", name: "Ari Chen", handle: "@ari.dev", avatar: "AC", country: "US", city: "New York", friends: [], ...{ schemaVersion: 1 as const, devScoreVersion: "v1" as const, week: "2026-W33", region: "New York", sessions: 8, activeMinutes: 640, focusScore: 86, recoveryScore: 88, devScore: 861, streak: 12 } },
];

export function CommunityPage() {
  const { sessions, preferences, profile, userId, updatePreferences } = useSprintly();
  const records = recordsOf(sessions);
  const [scope, setScope] = useState<"global" | "country" | "region" | "city" | "friends">(preferences.leaderboardScope);
  const [joinOpen, setJoinOpen] = useState(false);
  const packet = buildLeaderboardPacket(records, scope === "global" ? "GLOBAL" : profile.country, new Date(), preferences.timeZone);
  // Only opted-in developers may appear in rankings, and every entry must
  // belong to the exact packet week being rendered.
  const eligible: LeaderboardEntry[] = preferences.leaderboardOptIn
    ? [{ id: userId, name: profile.displayName, handle: `@${profile.handle}`, avatar: initials(profile.displayName), country: profile.country, city: profile.city, friends: [], ...packet, region: profile.region }, ...demoLeaders]
    : [...demoLeaders];
  const scoped = eligible
    .filter((entry) => entry.week === packet.week)
    .filter((entry) => scope === "global" ? true : scope === "friends" ? entry.friends.includes(userId) : scope === "country" ? entry.country === profile.country : scope === "region" ? entry.region === profile.region : entry.city === profile.city);
  const all: Array<{ entry: LeaderboardEntry; rank: number }> = [];
  for (const entry of [...scoped].sort((a, b) => b.devScore - a.devScore)) {
    const previous = all[all.length - 1];
    all.push({ entry, rank: previous && previous.entry.devScore === entry.devScore ? previous.rank : all.length + 1 });
  }
  const join = () => { updatePreferences({ leaderboardOptIn: true, leaderboardScope: scope }); setJoinOpen(false); toast.success("Leaderboard participation enabled", { description: "Only the aggregate fields shown below are shared." }); };
  return <div><PageHeader eyebrow="Competition · consent first" title="Leaderboard, your way." description="Rankings use a versioned composite score—not raw coding hours. Global, country, region, city, and friends views are all optional." action={preferences.leaderboardOptIn ? <Pill tone="green"><ShieldCheck className="size-3"/> Opted in · {preferences.leaderboardScope}</Pill> : <button onClick={() => setJoinOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold"><Trophy className="size-4"/> Join a leaderboard</button>}/>{!preferences.leaderboardOptIn && <Panel className="mb-3 border-[#9a9a9a]/20 bg-[#9a9a9a]/[.04] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-xl bg-[#9a9a9a]/10 text-[#9a9a9a]"><LockKeyhole className="size-5"/></div><div className="flex-1"><p className="text-sm font-medium">You are not ranked yet</p><p className="mt-1 text-xs leading-5 text-[#929292]">Joining is explicit. Your code, prompts, file names, raw terminal output, and complete history stay private.</p></div><button onClick={() => setJoinOpen(true)} className="min-h-10 rounded-lg border border-[#9a9a9a]/25 px-3 text-xs font-semibold text-[#c2c2c2]">Review shared fields</button></div></Panel>}<div className="mb-3 flex gap-2 overflow-x-auto">{(["global", "country", "region", "city", "friends"] as const).map((item) => <button key={item} onClick={() => setScope(item)} className={`min-h-10 shrink-0 rounded-lg px-4 text-xs capitalize ${scope === item ? "bg-white/[.08] text-white" : "text-[#828282] hover:bg-white/[.04]"}`}>{item}</button>)}</div><div className="grid gap-3 xl:grid-cols-[1.35fr_.65fr]"><Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/[.07] p-4"><div><h2 className="text-sm font-semibold">{scope === "global" ? "Global" : scope} rankings</h2><p className="mt-1 text-[10px] text-[#7a7a7a]">Week {packet.week} · Dev Score {packet.devScoreVersion}</p></div><Pill tone="violet">Composite score v1</Pill></div><div className="grid grid-cols-[45px_1fr_80px_60px] gap-3 border-b border-white/[.06] px-4 py-3 text-[10px] uppercase tracking-[.12em] text-[#686868] sm:grid-cols-[60px_1fr_100px_80px_80px]"><span>Rank</span><span>Developer</span><span>Dev Score</span><span>Streak</span><span>Focus</span></div>{all.map(({ entry, rank }) => <div key={entry.id} className={`grid min-h-[70px] grid-cols-[45px_1fr_80px_60px] items-center gap-3 border-b border-white/[.06] px-4 py-3 last:border-0 sm:grid-cols-[60px_1fr_100px_80px_80px] ${entry.id === userId ? "bg-[#f2f2f2]/[.08]" : ""}`}><div className={`mono text-sm font-semibold ${rank <= 3 ? "text-[#9a9a9a]" : "text-[#8b8b8b]"}`}>#{rank}</div><div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#2c2c2c] to-[#1b1b1b] text-[10px] font-semibold">{entry.avatar}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{entry.name}{entry.id === userId ? " · you" : ""}</p><p className="truncate text-[10px] text-[#767676]">{entry.handle}</p></div></div><span className="mono text-xs">{entry.devScore}</span><span className="flex items-center gap-1 text-xs text-[#aaaaaa]"><Flame className="size-3"/>{entry.streak}</span><span className="mono text-xs text-[#8b8b8b]">{entry.focusScore}</span></div>)}{!all.length && <div className="p-8 text-center text-xs text-[#7d7d7d]">No eligible entries for week {packet.week} in this scope yet. Developers appear here after they opt in during the same week.</div>}</Panel><div className="space-y-3"><Panel className="p-5"><p className="mono text-[10px] uppercase tracking-[.15em] text-[#7d7d7d]">Your packet</p><div className="mt-5 grid grid-cols-2 gap-3">{[["Sessions", packet.sessions], ["Minutes", packet.activeMinutes], ["Focus", packet.focusScore], ["Recovery", packet.recoveryScore], ["Streak", packet.streak], ["Score", packet.devScore]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{String(label)}</p></div>)}</div><p className="mt-4 text-[11px] leading-5 text-[#7d7d7d]">Only this aggregate packet is eligible for sharing. `devScoreVersion: v1` travels with it.</p></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Leave leaderboard</h2><p className="mt-2 text-xs leading-5 text-[#858585]">Leaving stops future submissions. Existing demo rankings remain visible in this local prototype but are marked as no longer participating.</p>{preferences.leaderboardOptIn && <button onClick={() => { updatePreferences({ leaderboardOptIn: false }); toast.success("Leaderboard participation disabled"); }} className="mt-5 min-h-10 rounded-lg border border-[#b7b7b7]/25 px-3 text-xs font-semibold text-[#bababa]">Leave leaderboard</button>}</Panel></div></div>{joinOpen && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#9a9a9a]">Explicit consent</p><h2 className="mt-2 text-xl font-semibold">Join the {scope} leaderboard?</h2></div><button onClick={() => setJoinOpen(false)} aria-label="Close consent dialog" className="grid size-10 place-items-center rounded-lg text-[#7a7a7a]"><X className="size-4"/></button></div><p className="mt-4 text-sm leading-6 text-[#a8a8a8]">Sprintly will share an aggregate weekly packet only:</p><ul className="mt-4 space-y-2 text-xs text-[#cacaca]"><li>• Weekly Dev Score and version</li><li>• Session count and active minutes</li><li>• Focus, recovery, and streak</li><li>• Display name, @handle, and your {scope === "global" ? "country" : scope} label appear beside your score</li></ul><p className="mt-3 text-xs leading-5 text-[#7d7d7d]">Equal scores share the same rank. You can leave at any time to stop future weeks.</p><p className="mt-4 text-xs leading-5 text-[#7d7d7d]">Your code, raw telemetry, prompts, file names, and terminal output are never published.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setJoinOpen(false)} className="min-h-11 rounded-lg border border-white/[.09] px-4 text-sm text-[#bdbdbd]">Cancel</button><button onClick={join} className="min-h-11 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold">Join leaderboard</button></div></div></div>}</div>;
}
