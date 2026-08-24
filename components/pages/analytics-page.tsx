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

function MetricCard({ icon: Icon, label, value, note, tone = "violet" }: { icon: typeof Activity; label: string; value: string; note: string; tone?: "violet" | "green" | "amber" | "cyan" }) {
  const colors = { violet: "bg-[#f2f2f2]/10 text-[#d2d2d2]", green: "bg-[#d0d0d0]/10 text-[#d0d0d0]", amber: "bg-[#9a9a9a]/10 text-[#9a9a9a]", cyan: "bg-[#bdbdbd]/10 text-[#bdbdbd]" };
  return <Panel className="p-4"><div className={`grid size-9 place-items-center rounded-lg ${colors[tone]}`}><Icon className="size-4"/></div><p className="mono mt-5 text-2xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-[#838383]">{label}</p><p className="mt-3 text-[10px] text-[#c0c0c0]">{note}</p></Panel>;
}

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

function Progress({ value, color = "#f2f2f2" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

function MixRow({ label, value, color }: { label: string; value: number; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-[#939393]">{label}</span><span className="mono">{value}%</span></div><Progress value={value} color={color}/></div>; }

export function AnalyticsPage() {
  const { sessions, preferences } = useSprintly();
  const timeZone = preferences.timeZone;
  const records = recordsOf(sessions);
  const [range, setRange] = useState<"week" | "month">("week");
  const filtered = filterSessionsByRange(records, range, new Date(), undefined, timeZone);
  const aggregate = aggregateSessions(filtered);
  const streaks = getStreakStats(records, new Date(), timeZone);
  // The immediately preceding calendar period, derived from the same
  // timezone model as the current-period filter.
  const previousBounds = getPreviousPeriodBounds(range, new Date(), timeZone);
  const previous = filterSessionsByRange(records, "custom", new Date(), previousBounds, timeZone);
  const previousAggregate = aggregateSessions(previous);
  const change = previousAggregate.activeDurationSeconds ? Math.round(((aggregate.activeDurationSeconds - previousAggregate.activeDurationSeconds) / previousAggregate.activeDurationSeconds) * 100) : 0;
  return <div>
    <PageHeader eyebrow="Recap · own activity only" title={`${range === "week" ? "This week" : "This month"}, decoded.`} description="Compare your current activity with your previous personal window. No global benchmark is used to manipulate the numbers." action={<div className="flex gap-2">{(["week", "month"] as const).map((item) => <button key={item} onClick={() => setRange(item)} className={`min-h-10 rounded-lg px-3 text-xs ${range === item ? "bg-[#f2f2f2] text-[#0b0b0b]" : "border border-white/[.08] text-[#8b8b8b]"}`}>{item === "week" ? "This week" : "This month"}</button>)}</div>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <MetricCard icon={Timer} label="Coding time" value={formatDuration(aggregate.activeDurationSeconds)} note={`${change >= 0 ? "+" : ""}${change}% vs previous`} />
      <MetricCard icon={Code2} label="Sessions" value={number(aggregate.sessionCount)} note={`${number(aggregate.activity.edits)} edits`} tone="cyan" />
      <MetricCard icon={Activity} label="Focus" value={`${aggregate.scores.focus}`} note={`Previous ${previousAggregate.scores.focus}`} tone="green" />
      <MetricCard icon={HeartPulse} label="Recovery" value={`${aggregate.reliability.recoveryRate}%`} note={`${aggregate.reliability.failures} failures`} tone="amber" />
      <MetricCard icon={Flame} label="Streak" value={`${streaks.current} days`} note={`Best ${streaks.longest}`} tone="amber" />
    </div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[1.2fr_.8fr]">
      <Panel className="p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Coding mix</h2><p className="mt-1 text-xs text-[#7a7a7a]">Weighted across {aggregate.sessionCount} validated sessions</p></div><Pill tone="violet">Dev Score {computeCompositeDevScore(aggregate)}</Pill></div><div className="mt-8 space-y-6"><MixRow label="Manual" value={aggregate.coding.manualPercent} color="#f2f2f2"/><MixRow label="AI-assisted" value={aggregate.coding.aiAssistedPercent} color="#bdbdbd"/><MixRow label="Automation" value={aggregate.coding.automationPercent} color="#d0d0d0"/></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Builds", aggregate.terminal.build], ["Tests", aggregate.terminal.test], ["Files", aggregate.activity.filesTouched], ["Prompts", aggregate.ai.claudeCodePrompts + aggregate.ai.codexPrompts + aggregate.ai.copilotPrompts]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{number(Number(value))}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{String(label)}</p></div>)}</div></Panel>
      <Panel className="p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Quality pulse</h2><Radar className="size-4 text-[#d2d2d2]" /></div><div className="mt-6 space-y-5"><MixRow label="Focus" value={aggregate.scores.focus} color="#d2d2d2"/><MixRow label="Testing discipline" value={aggregate.scores.testingDiscipline} color="#bdbdbd"/><MixRow label="Consistency" value={aggregate.scores.consistency} color="#d0d0d0"/><MixRow label="AI balance" value={aggregate.scores.aiBalance} color="#9a9a9a"/></div><div className="mt-8 rounded-xl border border-[#d0d0d0]/15 bg-[#d0d0d0]/[.04] p-4"><p className="text-sm font-medium">{aggregate.archetype}</p><p className="mt-1 text-xs leading-5 text-[#858585]">{aggregate.traits.join(" · ") || "Traits appear as your record grows."}</p></div></Panel>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-2"><Panel className="p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Weekly recap</h2><p className="mt-1 text-xs text-[#7a7a7a]">A card you can customize before sharing</p></div><Link href="/app/share?kind=weekly" className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-3 text-xs font-semibold">Create card <Upload className="size-3.5" /></Link></div><p className="mt-6 text-2xl font-semibold tracking-[-.04em]">{aggregate.sessionCount} sessions · {formatDuration(aggregate.activeDurationSeconds)}</p><p className="mt-2 text-xs text-[#8b8b8b]">{aggregate.coding.aiAssistedPercent}% AI-assisted · {aggregate.reliability.recoveryRate}% recovery · {streaks.current} day streak.</p></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Privacy boundary</h2><p className="mt-3 text-xs leading-5 text-[#858585]">These aggregates are computed from selected sessions. Raw prompts, code, terminal output, and secrets never enter the social layer.</p><Link href="/app/settings" className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#c2c2c2]">Review privacy controls <ChevronRight className="size-3.5" /></Link></Panel></div>
  </div>;
}
