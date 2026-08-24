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

function Progress({ value, color = "#f2f2f2" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

function dateLabel(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }

function MixRow({ label, value, color }: { label: string; value: number; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-[#939393]">{label}</span><span className="mono">{value}%</span></div><Progress value={value} color={color}/></div>; }

export function SessionDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const { sessions } = useSprintly();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  // No fallback to the first record: an unknown ID must not silently
  // resolve to a different session.
  const session = sessions.map((item) => item.record).find((record) => record.sessionId === id);
  if (!session) {
    return <Panel className="p-8"><div className="text-center"><FileUp className="mx-auto size-8 text-[#f2f2f2]"/><p className="mt-4 text-sm font-medium">Session not found</p><p className="mt-2 text-xs text-[#7d7d7d]">{id ? `No session with ID "${id}" exists in your imported history.` : "This URL does not identify a session in your history."}</p><Link href="/app/sessions" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-3 text-xs font-semibold">Back to history <ChevronRight className="size-3.5"/></Link></div></Panel>;
  }
  return <div><PageHeader eyebrow={`Session · ${session.sessionId}`} title={session.archetype.primary} description={`${dateLabel(session.startedAt)} · ${formatDuration(session.activeDurationSeconds)} · aggregate data only`} action={<Link href={`/app/share?kind=session&sessionId=${session.sessionId}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold"><Upload className="size-4"/> Create share card</Link>}/><Panel className="relative overflow-hidden p-6 sm:p-8"><div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(157,157,157,.14),transparent_55%)]"/><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap gap-2"><Pill tone="cyan"><Clock3 className="size-3"/> {formatDuration(session.activeDurationSeconds)}</Pill><Pill tone="green"><ShieldCheck className="size-3"/> {session.signature && session.publicKeyId ? "Signed · not verified" : "Unverified packet"}</Pill></div><p className="mono mt-8 text-6xl font-semibold tracking-[-.07em]">{formatDuration(session.activeDurationSeconds)}</p><p className="mt-3 text-sm text-[#8b8b8b]">{session.scores.focus}% focused · Imported session score {session.scores.devScore}</p><div className="mt-5 flex flex-wrap gap-2">{session.archetype.traits.map((trait) => <Pill key={trait} tone="gray">{trait}</Pill>)}</div></div><div className="grid grid-cols-2 gap-2">{[[FileCode2, number(session.activity.filesTouched), "files"], [Code2, number(session.activity.edits), "edits"], [Terminal, number(session.terminal.totalCommands), "terminal"], [HeartPulse, `${session.reliability.recoveryRate}%`, "recovery"]].map(([Icon, value, label]) => { const C = Icon as typeof FileCode2; return <div key={String(label)} className="min-w-[110px] rounded-xl border border-white/[.07] bg-white/[.025] p-4"><C className="size-4 text-[#d6d6d6]"/><p className="mono mt-3 text-xl font-semibold">{String(value)}</p><p className="mt-1 text-xs text-[#808080]">{String(label)}</p></div>; })}</div></div></Panel><div className="mt-3 grid gap-3 xl:grid-cols-2"><Panel className="p-5"><h2 className="text-sm font-semibold">Coding mix</h2><div className="mt-6 space-y-5"><MixRow label="Manual" value={session.coding.manualPercent} color="#f2f2f2"/><MixRow label="AI-assisted" value={session.coding.aiAssistedPercent} color="#bdbdbd"/><MixRow label="Automation" value={session.coding.automationPercent} color="#d0d0d0"/></div></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Quality signals</h2><div className="mt-6 grid grid-cols-2 gap-3">{[["Focus", session.scores.focus], ["Testing discipline", session.scores.testingDiscipline], ["Recovery", session.scores.recovery], ["AI balance", session.scores.aiBalance]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-xs text-[#838383]">{String(label)}</p><p className="mono mt-3 text-2xl font-semibold">{String(value)}</p><div className="mt-3"><Progress value={Number(value)} color="#d2d2d2"/></div></div>)}</div></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Terminal activity</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Builds", session.terminal.build], ["Tests", session.terminal.test], ["Git", session.terminal.git], ["Other", session.terminal.other]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white/[.025] p-4"><Terminal className="size-4 text-[#bdbdbd]"/><p className="mono mt-3 text-xl font-semibold">{String(value)}</p><p className="mt-1 text-xs text-[#7d7d7d]">{String(label)}</p></div>)}</div></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">AI activity</h2><div className="mt-5 space-y-3">{[["Claude Code", session.ai.claudeCodePrompts], ["Codex", session.ai.codexPrompts], ["Copilot", session.ai.copilotPrompts]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between rounded-lg bg-white/[.025] px-3 py-3 text-xs"><span>{String(label)}</span><span className="mono text-[#d0d0d0]">{String(value)} prompts</span></div>)}<p className="pt-2 text-[11px] leading-5 text-[#7d7d7d]">Prompts, source code, raw terminal output, and secrets are not published by this view.</p></div></Panel></div></div>;
}
