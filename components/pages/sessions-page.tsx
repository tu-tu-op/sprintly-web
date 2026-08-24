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

function MetricCard({ icon: Icon, label, value, note, tone = "violet" }: { icon: typeof Activity; label: string; value: string; note: string; tone?: "violet" | "green" | "amber" | "cyan" }) {
  const colors = { violet: "bg-[#f2f2f2]/10 text-[#d2d2d2]", green: "bg-[#d0d0d0]/10 text-[#d0d0d0]", amber: "bg-[#9a9a9a]/10 text-[#9a9a9a]", cyan: "bg-[#bdbdbd]/10 text-[#bdbdbd]" };
  return <Panel className="p-4"><div className={`grid size-9 place-items-center rounded-lg ${colors[tone]}`}><Icon className="size-4"/></div><p className="mono mt-5 text-2xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-[#838383]">{label}</p><p className="mt-3 text-[10px] text-[#c0c0c0]">{note}</p></Panel>;
}

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

function dateRangeTitle(range: DateRange) {
  return range === "today" ? "Today" : range === "week" ? "This week" : range === "month" ? "This month" : range === "custom" ? "Custom range" : "All time";
}

function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "cyan" | "gray" }) {
  const colors = { violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]", green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]", amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/[.08] text-[#c2c2c2]", cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/[.08] text-[#c7c7c7]", gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${colors[tone]}`}>{children}</span>;
}

function dateLabel(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }

function summarize(records: SprintlySession[]) {
  const aggregate = aggregateSessions(records);
  return { aggregate, failures: aggregate.reliability.failures, recovery: aggregate.reliability.recoveryRate };
}

function ImportFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessions, importSessions } = useSprintly();
  const inputRef = useRef<HTMLInputElement>(null);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  if (!open) return null;
  const existingIds = new Set(sessions.map((session) => session.record.sessionId));
  const preview = validation ? summarize(validation.sessions) : null;
  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    // Reject oversized selections before reading them into memory.
    if (!isSupportedImportFileSize(file.size)) {
      setValidation({ ok: false, sessions: [], duplicates: [], issues: [{ index: -1, message: `"${file.name}" is too large (${Math.ceil(file.size / 1_000_000)} MB). Choose an export under ${Math.floor(MAX_IMPORT_FILE_BYTES / 1_000_000)} MB.` }], contract: SPRINTLY_CONTRACT });
      return;
    }
    setReading(true);
    setValidation(parseSprintlyImportText(await file.text(), existingIds));
    setReading(false);
  };
  const close = () => { setValidation(null); setFileName(""); onClose(); };
  const confirm = () => { if (!validation?.sessions.length || validation.issues.length) return; importSessions(validation.sessions); close(); };
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="import-title" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"><div className="flex items-start justify-between border-b border-white/[.07] p-5 sm:p-6"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#bdbdbd]">Explicit handoff · Sprintly session v1</p><h2 id="import-title" className="mt-2 text-xl font-semibold">Import Sprintly Data</h2><p className="mt-2 text-xs leading-5 text-[#858585]">Choose an extension JSON export. Nothing enters your history until you confirm this preview.</p></div><button onClick={close} aria-label="Close import dialog" className="grid size-10 place-items-center rounded-lg text-[#7a7a7a] hover:bg-white/[.05]"><X className="size-4"/></button></div><div className="space-y-4 p-5 sm:p-6"><input ref={inputRef} type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])}/><button onClick={() => inputRef.current?.click()} className="flex min-h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/[.16] bg-white/[.02] text-sm text-[#c1c1c1] hover:bg-white/[.04]"><FileJson className="mb-3 size-6 text-[#d6d6d6]"/>{reading ? "Reading export…" : fileName || "Select a .json export"}<span className="mt-2 text-[10px] text-[#777777]">Local file access is limited to this explicit selection.</span></button>{validation && <>{preview && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{validation.sessions.length}</p><p className="text-[10px] text-[#7d7d7d]">sessions ready</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{formatDuration(preview.aggregate.activeDurationSeconds)}</p><p className="text-[10px] text-[#7d7d7d]">coding time</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{preview.aggregate.coding.manualPercent}%</p><p className="text-[10px] text-[#7d7d7d]">manual</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{preview.recovery}%</p><p className="text-[10px] text-[#7d7d7d]">recovery</p></div></div>}{validation.issues.length > 0 && <div className="rounded-xl border border-[#b7b7b7]/25 bg-[#b7b7b7]/[.06] p-4"><p className="text-sm font-medium text-[#bdbdbd]">{validation.issues.length} record{validation.issues.length === 1 ? "" : "s"} rejected</p><ul className="mt-2 space-y-1 text-xs leading-5 text-[#9f9f9f]">{validation.issues.slice(0, 5).map((issue) => <li key={`${issue.index}-${issue.message}`}>Record {issue.index + 1}: {issue.message}</li>)}</ul><p className="mt-2 text-[11px] text-[#848484]">Fix the export and select it again. Valid records will not be silently imported alongside malformed records.</p></div>}{validation.duplicates.length > 0 && <div className="rounded-xl border border-[#9a9a9a]/25 bg-[#9a9a9a]/[.06] p-4"><p className="text-sm font-medium text-[#c2c2c2]">{validation.duplicates.length} duplicate{validation.duplicates.length === 1 ? "" : "s"} skipped</p><p className="mt-1 text-xs leading-5 text-[#9b9b9b]">{validation.duplicates.map((duplicate) => `${duplicate.sessionId} (${duplicate.reason === "already-imported" ? "Already imported" : "Repeated in file"})`).join(" · ")}</p></div>}{validation.sessions.length > 0 && <div className="rounded-xl border border-white/[.07] bg-black/10 p-4"><div className="flex items-center justify-between"><p className="text-sm font-medium">Preview imported sessions</p><Pill tone="green"><Check className="size-3"/> Validated</Pill></div><div className="mt-3 space-y-2">{validation.sessions.slice(0, 6).map((session) => <div key={session.sessionId} className="flex items-center justify-between gap-3 rounded-lg bg-white/[.025] px-3 py-2 text-xs"><div className="min-w-0"><p className="truncate font-medium">{session.archetype.primary}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{dateLabel(session.startedAt)} · {session.sessionId}</p></div><span className="mono shrink-0 text-[#d0d0d0]">{formatDuration(session.activeDurationSeconds)}</span></div>)}</div>{validation.sessions.length > 6 && <p className="mt-2 text-[10px] text-[#797979]">+ {validation.sessions.length - 6} more validated sessions</p>}</div>}</>}</div><div className="flex flex-col-reverse gap-2 border-t border-white/[.07] p-5 sm:flex-row sm:justify-end sm:p-6"><button onClick={close} className="min-h-11 rounded-lg border border-white/[.09] px-4 text-sm text-[#bdbdbd]">Cancel</button><button onClick={confirm} disabled={!validation?.sessions.length || Boolean(validation.issues.length)} className="min-h-11 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Import validated sessions</button></div></div></div>;
}

function avatarStyle(archetype: string, traits: string[]) {
  const seed = `${archetype}:${traits.join(":")}`;
  const palettes = ["from-[#f2f2f2] to-[#bdbdbd]", "from-[#9a9a9a] to-[#b7b7b7]", "from-[#d0d0d0] to-[#bdbdbd]", "from-[#d2d2d2] to-[#9a9a9a]"];
  return palettes[seed.length % palettes.length];
}

function SessionRow({ session }: { session: SprintlySession }) {
  const [expanded, setExpanded] = useState(false);
  return <Panel className="overflow-hidden"><button onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="grid min-h-[94px] w-full gap-4 p-4 text-left sm:grid-cols-[125px_1fr_auto] sm:items-center sm:p-5"><div><p className="text-xs font-medium">{dateLabel(session.startedAt)}</p><p className="mono mt-1 text-[10px] text-[#797979]">{new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(session.startedAt))}</p></div><div className="flex min-w-0 items-center gap-3"><div className={`grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${avatarStyle(session.archetype.primary, session.archetype.traits)}`}><Code2 className="size-4"/></div><div className="min-w-0"><p className="truncate text-sm font-medium">{session.archetype.primary}</p><p className="mt-1 truncate text-xs text-[#7e7e7e]">{session.archetype.traits.join(" · ")}</p></div></div><div className="flex items-center gap-5"><div className="text-right"><p className="mono text-base font-semibold">{formatDuration(session.activeDurationSeconds)}</p><p className="mt-1 text-[10px] text-[#c0c0c0]">{session.scores.focus}% focus</p></div><ChevronDown className={`size-4 text-[#6c6c6c] transition-transform ${expanded ? "rotate-180" : ""}`}/></div></button>{expanded && <div className="border-t border-white/[.07] bg-black/10 p-4 sm:p-5"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[[FileCode2, number(session.activity.filesTouched), "files"], [Code2, number(session.activity.edits), "edits"], [Terminal, number(session.terminal.totalCommands), "commands"], [HeartPulse, `${session.reliability.recoveryRate}%`, "recovery"], [Trophy, sessionCompositeScore(session).toString(), "dev score v1"]].map(([Icon, value, label]) => { const C = Icon as typeof FileCode2; return <div key={String(label)} className="rounded-lg bg-white/[.025] p-3"><C className="size-3.5 text-[#767676]"/><p className="mono mt-3 text-sm font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#777777]">{String(label)}</p></div>; })}</div><div className="mt-4 flex flex-wrap items-center gap-3"><Link href={`/app/sessions/${session.sessionId}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-3 text-xs font-semibold">Open full session <ChevronRight className="size-3.5"/></Link><Pill tone="gray"><HardDrive className="size-3"/> {session.signature ? "Signed · not verified" : "Demo / unverified"}</Pill></div></div>}</Panel>;
}

export function SessionsPage() {
  const { sessions, preferences } = useSprintly();
  const [range, setRange] = useState<DateRange>("week");
  const [sort, setSort] = useState<"newest" | "longest" | "score">("newest");
  const [custom, setCustom] = useState({ from: "2026-08-01", to: "2026-08-31" });
  const [importOpen, setImportOpen] = useState(false);
  const records = recordsOf(sessions);
  const visible = filterSessionsByRange(records, range, new Date(), custom, preferences.timeZone).sort((a, b) => sort === "longest" ? b.activeDurationSeconds - a.activeDurationSeconds : sort === "score" ? sessionCompositeScore(b) - sessionCompositeScore(a) : b.startedAt.localeCompare(a.startedAt));
  const aggregate = aggregateSessions(visible);
  return <div><PageHeader eyebrow="Cloud history · explicit imports" title="Session history" description="Every row is an imported or authorized session. Duplicate session IDs are skipped and invalid records never enter this list." action={<button onClick={() => setImportOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold"><FileUp className="size-4"/> Import JSON</button>}/><div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-3 sm:flex-row sm:items-center"><div className="flex gap-2 overflow-x-auto">{(["today", "week", "month", "all", "custom"] as DateRange[]).map((item) => <button key={item} onClick={() => setRange(item)} className={`min-h-10 shrink-0 rounded-lg px-3 text-xs ${range === item ? "bg-[#f2f2f2] text-[#0b0b0b]" : "text-[#8b8b8b] hover:bg-white/[.04]"}`}>{dateRangeTitle(item)}</button>)}</div><div className="ml-auto flex items-center gap-2"><label htmlFor="session-sort" className="text-[10px] uppercase tracking-[.14em] text-[#6d6d6d]">Sort</label><select id="session-sort" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-9 rounded-lg border border-white/[.08] bg-[#181818] px-2 text-xs text-[#c8c8c8]"><option value="newest">Newest</option><option value="longest">Longest</option><option value="score">Dev Score</option></select></div></div>{range === "custom" && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-3 text-xs"><label>From <input type="date" value={custom.from} onChange={(event) => setCustom({ ...custom, from: event.target.value })} className="ml-2 h-9 rounded-lg border border-white/[.08] bg-[#181818] px-2 text-xs"/></label><label>To <input type="date" value={custom.to} onChange={(event) => setCustom({ ...custom, to: event.target.value })} className="ml-2 h-9 rounded-lg border border-white/[.08] bg-[#181818] px-2 text-xs"/></label></div>}<div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4"><MetricCard icon={Timer} label="Coding time" value={formatDuration(aggregate.activeDurationSeconds)} note={`${aggregate.sessionCount} sessions`}/><MetricCard icon={Activity} label="Edits" value={number(aggregate.activity.edits)} note={`${number(aggregate.activity.filesTouched)} files touched`} tone="cyan"/><MetricCard icon={Terminal} label="Builds + tests" value={number(aggregate.terminal.build + aggregate.terminal.test)} note={`${number(aggregate.terminal.test)} tests`} tone="green"/><MetricCard icon={Trophy} label="Dev Score" value={`${computeCompositeDevScore(aggregate)}`} note={`${aggregate.scores.focus}% focus`} tone="amber"/></div><div className="space-y-3">{visible.map((session) => <SessionRow key={session.sessionId} session={session}/>)}{!visible.length && <Panel className="grid min-h-64 place-items-center p-6 text-center"><div><FileUp className="mx-auto size-8 text-[#f2f2f2]"/><p className="mt-4 text-sm font-medium">No sessions in this range</p><p className="mt-2 text-xs text-[#7d7d7d]">Import an extension export or choose another date range.</p></div></Panel>}</div><ImportFlow open={importOpen} onClose={() => setImportOpen(false)}/></div>;
}
