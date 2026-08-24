"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  CircleCheck,
  ChevronRight,
  Code2,
  Flame,
  Gauge,
  GitBranch,
  Layers3,
  MoreHorizontal,
  Rocket,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  aggregateSessions,
  computeCompositeDevScore,
  computePersonalRecords,
  dateKey,
  filterSessionsByRange,
  formatDuration,
  getStreakStats,
  sessionCompositeScore,
  zonedClock,
  type DateRange,
} from "@/lib/sprintly/analytics";
import type { SprintlySession } from "@/lib/sprintly/contract";
import { cn } from "@/lib/utils";
import { useSprintly } from "./sprintly-provider";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const panel = "rounded-xl border border-[#2b2b2b] bg-[#121212] shadow-[0_18px_48px_rgba(0,0,0,.3)]";

const ranges: Array<{ label: string; value: DateRange }> = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "All time", value: "all" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(Math.round(value));
const dateText = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));

function MetricCard({ icon: Icon, label, value, detail, tone, trend }: { icon: LucideIcon; label: string; value: string; detail: string; tone: "bright" | "silver" | "mid" | "dark"; trend?: string }) {
  const tones = {
    bright: "bg-white/[.09] text-[#f4f4f4]",
    silver: "bg-[#c8c8c8]/10 text-[#dddddd]",
    mid: "bg-[#9a9a9a]/10 text-[#bdbdbd]",
    dark: "bg-[#707070]/20 text-[#e1e1e1]",
  };

  return <section className={`${panel} p-5`}><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-lg ${tones[tone]}`}><Icon className="size-[18px]" /></span>{trend && <span className="inline-flex items-center gap-1 rounded-full bg-white/[.08] px-2 py-1 text-[10px] font-semibold text-[#e0e0e0]"><TrendingUp className="size-3" />{trend}</span>}</div><p className="mono mt-6 text-[25px] font-semibold tracking-[-.05em] text-[#f4f4f4]">{value}</p><p className="mt-1 text-xs font-medium text-[#c8c8c8]">{label}</p><p className="mt-3 text-[10px] text-[#747474]">{detail}</p></section>;
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="text-[#929292]">{label}</span><span className="mono font-semibold text-[#c8c8c8]">{Math.round(value)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#2b2b2b]"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div></div>;
}

function ActivityChart({ data }: { data: Array<{ day: string; hours: number; edits: number }> }) {
  return <div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="sprintly-activity-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ededed" stopOpacity={0.2} /><stop offset="100%" stopColor="#ededed" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#2b2b2b" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777777", fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#777777", fontSize: 10 }} width={32} tickFormatter={(value) => `${value}h`} /><Tooltip cursor={{ stroke: "#555555", strokeDasharray: "4 4" }} contentStyle={{ border: "1px solid #414141", borderRadius: 12, background: "#121212", color: "#f4f4f4", fontSize: 11, boxShadow: "0 18px 48px rgba(0,0,0,.34)" }} formatter={(value, name) => { const numericValue = Number(value ?? 0); const metric = String(name); return [metric === "hours" ? `${numericValue.toFixed(1)}h` : formatNumber(numericValue), metric === "hours" ? "Coding time" : "Edits"]; }} /><Area type="monotone" dataKey="hours" stroke="#ededed" strokeWidth={2.5} fill="url(#sprintly-activity-fill)" activeDot={{ r: 4, fill: "#ededed", stroke: "#121212", strokeWidth: 2 }} /><Area type="monotone" dataKey="edits" stroke="transparent" fill="transparent" /></AreaChart></ResponsiveContainer></div>;
}

function CodingMix({ values }: { values: Array<{ name: string; value: number; color: string }> }) {
  const hasData = values.some((item) => item.value > 0);
  const chartValues = hasData ? values : [{ name: "No sessions", value: 100, color: "#303030" }];

  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center"><div className="h-[190px] w-[190px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartValues} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={hasData ? 3 : 0} stroke="none" startAngle={90} endAngle={-270}>{chartValues.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ border: "1px solid #414141", borderRadius: 12, background: "#121212", color: "#f4f4f4", fontSize: 11 }} /></PieChart></ResponsiveContainer></div><div className="w-full space-y-4">{values.map((item) => <div key={item.name} className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-xs text-[#929292]"><span className="size-2 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="mono text-xs font-semibold text-[#c8c8c8]">{Math.round(item.value)}%</span></div>)}<div className="rounded-lg bg-[#1a1a1a] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#747474]">AI balance</p><p className="mt-1 text-xs text-[#929292]">{hasData ? "Your record keeps assistance visible without losing the human signal." : "Import a session to see your coding mix."}</p></div></div></div>;
}

function SessionTable({ sessions }: { sessions: SprintlySession[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-white/[.1] text-[10px] uppercase tracking-[.13em] text-[#747474]"><th className="px-5 py-3 font-semibold">Session</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Focus</th><th className="px-3 py-3 font-semibold">Duration</th><th className="px-5 py-3 text-right font-semibold">Score</th></tr></thead><tbody>{sessions.length ? sessions.map((session) => <tr key={session.sessionId} className="group border-b border-white/[.1] last:border-0 hover:bg-white/[.04]"><td className="px-5 py-4"><Link href={`/app/sessions/${session.sessionId}`} className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.08] text-[#e1e1e1]"><Code2 className="size-4" /></span><span className="min-w-0"><span className="block max-w-[220px] truncate text-xs font-semibold text-[#f4f4f4]">{session.archetype.primary}</span><span className="mono mt-1 block truncate text-[10px] text-[#747474]">{session.sessionId}</span></span></Link></td><td className="px-3 py-4 text-xs text-[#929292]">{dateText(session.startedAt)}</td><td className="px-3 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e0e0e0]"><span className="size-1.5 rounded-full bg-[#e0e0e0]" />{session.scores.focus}%</span></td><td className="mono px-3 py-4 text-xs text-[#929292]">{formatDuration(session.activeDurationSeconds)}</td><td className="mono px-5 py-4 text-right text-xs font-semibold text-[#f4f4f4]">{sessionCompositeScore(session)}</td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-xs text-[#929292]">No sessions in this range yet. Import a Sprintly export to fill this table.</td></tr>}</tbody></table></div>;
}

export function Dashboard() {
  const { sessions, profile, preferences } = useSprintly();
  const timeZone = preferences.timeZone;
  const [range, setRange] = useState<DateRange>("week");
  const records = useMemo(() => sessions.map((session) => session.record), [sessions]);
  const scopedRecords = useMemo(() => filterSessionsByRange(records, range, new Date(), undefined, timeZone), [records, range, timeZone]);
  const aggregate = useMemo(() => aggregateSessions(scopedRecords), [scopedRecords]);
  const allTimeAggregate = useMemo(() => aggregateSessions(records), [records]);
  const streaks = useMemo(() => getStreakStats(records, new Date(), timeZone), [records, timeZone]);
  const personal = useMemo(() => computePersonalRecords(records, streaks, timeZone), [records, streaks, timeZone]);
  const recentSessions = useMemo(() => records.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [records]);
  const activityData = useMemo(() => {
    const clock = zonedClock(new Date(), timeZone);
    const baseUtc = Date.UTC(clock.year, clock.month - 1, clock.day);
    return Array.from({ length: 7 }, (_, index) => {
      const dayInstant = baseUtc - (6 - index) * 86_400_000;
      const key = new Date(dayInstant).toISOString().slice(0, 10);
      const daySessions = scopedRecords.filter((session) => dateKey(session.startedAt, timeZone) === key);
      return { day: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(dayInstant + 43_200_000)), hours: daySessions.reduce((sum, session) => sum + session.activeDurationSeconds, 0) / 3600, edits: daySessions.reduce((sum, session) => sum + session.activity.edits, 0) };
    });
  }, [scopedRecords, timeZone]);
  const codingMix = [
    { name: "Manual", value: aggregate.coding.manualPercent, color: "#eeeeee" },
    { name: "AI-assisted", value: aggregate.coding.aiAssistedPercent, color: "#adadad" },
    { name: "Automation", value: aggregate.coding.automationPercent, color: "#666666" },
  ];
  const devScore = computeCompositeDevScore(aggregate);
  const healthy = aggregate.reliability.recoveryRate >= 80 && aggregate.scores.focus >= 75;

  return <div className="space-y-6">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.1] px-2.5 py-1 text-[10px] font-semibold text-[#e8e8e8]"><CircleCheck className="size-3.5" /> Private by default</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#9a9a9a]/10 px-2.5 py-1 text-[10px] font-semibold text-[#c8c8c8]"><Sparkles className="size-3.5" /> {aggregate.archetype}</span></div><h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-.06em] text-[#f4f4f4]">Good morning, {profile.displayName.split(" ")[0]}.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#929292]">A clear view of the work you chose to record. Your focus, rhythm, and developer signals in one place.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="inline-flex rounded-lg border border-white/[.1] bg-[#1a1a1a] p-1">{ranges.map((item) => <button key={item.value} onClick={() => setRange(item.value)} className={cn("min-h-9 rounded-md px-3 text-[11px] font-semibold transition", range === item.value ? "bg-[#f2f2f2] text-[#0b0b0b] shadow-[0_8px_18px_rgba(255,255,255,.1)]" : "text-[#929292] hover:bg-white/[.06] hover:text-[#f4f4f4]")}>{item.label}</button>)}</div><Link href="/app/settings" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f2f2f2] px-4 text-xs font-semibold text-[#0b0b0b] shadow-[0_8px_18px_rgba(255,255,255,.1)] transition hover:bg-[#ffffff]"><Sparkles className="size-3.5" /> Import data</Link></div></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={TimerReset} label="Coding time" value={formatDuration(aggregate.activeDurationSeconds)} detail={range === "week" ? "Across this week" : `Across ${aggregate.sessionCount} recorded sessions`} tone="bright" trend={aggregate.sessionCount ? `${aggregate.sessionCount} sessions` : undefined} /><MetricCard icon={Gauge} label="Focus score" value={`${aggregate.scores.focus}`} detail="Own-record score out of 100" tone="silver" trend={aggregate.scores.focus ? `${aggregate.scores.focus}%` : undefined} /><MetricCard icon={Rocket} label="Dev Score" value={`${devScore}`} detail="Composite Sprintly v1 score" tone="mid" trend={devScore ? "v1" : undefined} /><MetricCard icon={Flame} label="Current streak" value={`${streaks.current}d`} detail={`Best streak ${streaks.longest} days`} tone="dark" trend={streaks.current ? "Active" : undefined} /></div>

    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className={`${panel} p-5 sm:p-6`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white/[.08] text-[#e6e6e6]"><BarChart3 className="size-4" /></span><h2 className="text-sm font-semibold text-[#f4f4f4]">Coding activity</h2></div><p className="mt-2 text-xs text-[#929292]">Active coding hours across the selected range.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-white/[.05] px-2.5 py-1.5 text-[10px] font-medium text-[#929292]"><span className="size-2 rounded-full bg-[#eeeeee]" /> Hours focused</span></div><div className="mt-6"><ActivityChart data={activityData} /></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[.1] pt-4"><div><p className="mono text-sm font-semibold text-[#f4f4f4]">{formatNumber(aggregate.activity.edits)}</p><p className="mt-1 text-[10px] text-[#747474]">edits</p></div><div><p className="mono text-sm font-semibold text-[#f4f4f4]">{formatNumber(aggregate.activity.filesTouched)}</p><p className="mt-1 text-[10px] text-[#747474]">files touched</p></div><div><p className="mono text-sm font-semibold text-[#f4f4f4]">{formatNumber(aggregate.terminal.totalCommands)}</p><p className="mt-1 text-[10px] text-[#747474]">terminal events</p></div></div></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#adadad]/10 text-[#d0d0d0]"><Code2 className="size-4" /></span><h2 className="text-sm font-semibold text-[#f4f4f4]">Coding mix</h2></div><p className="mt-2 text-xs text-[#929292]">How this record was produced.</p></div><button aria-label="More coding mix options" className="grid size-8 place-items-center rounded-lg text-[#747474] hover:bg-white/[.06] hover:text-[#f4f4f4]"><MoreHorizontal className="size-4" /></button></div><div className="mt-5"><CodingMix values={codingMix} /></div></section></div>

    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b border-white/[.1] px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold text-[#f4f4f4]">Recent sessions</h2><p className="mt-1 text-xs text-[#929292]">The latest records in your Sprintly history.</p></div><Link href="/app/sessions" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#d5d5d5]">View all <ChevronRight className="size-3.5" /></Link></div><SessionTable sessions={recentSessions.slice(0, 5)} /></section><div className="space-y-4"><section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-[#f4f4f4]">Momentum health</h2><p className="mt-1 text-xs text-[#929292]">Signals that shape your progress.</p></div><span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", healthy ? "bg-white/[.1] text-[#e2e2e2]" : "bg-[#303030] text-[#c0c0c0]")}>{healthy ? "Healthy" : "Needs a reset"}</span></div><div className="mt-6 space-y-5"><ProgressRow label="Focus" value={aggregate.scores.focus} color="#eeeeee" /><ProgressRow label="Testing discipline" value={aggregate.scores.testingDiscipline} color="#bdbdbd" /><ProgressRow label="Recovery" value={aggregate.reliability.recoveryRate} color="#8d8d8d" /><ProgressRow label="Consistency" value={aggregate.scores.consistency} color="#5e5e5e" /></div><Link href="/app/analytics" className="mt-6 inline-flex items-center gap-1 text-[11px] font-semibold text-[#d5d5d5]">Open recap <ArrowUpRight className="size-3.5" /></Link></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#8d8d8d]/15 text-[#d5d5d5]"><ShieldCheck className="size-4" /></span><div><h2 className="text-sm font-semibold text-[#f4f4f4]">Data boundary</h2><p className="mt-1 text-[10px] text-[#929292]">Your sharing controls</p></div></div><div className="mt-5 space-y-3 text-xs"><div className="flex items-center justify-between"><span className="text-[#929292]">Profile visibility</span><span className="font-semibold text-[#f4f4f4]">{preferences.profileVisibility === "public" ? "Public" : "Private"}</span></div><div className="flex items-center justify-between"><span className="text-[#929292]">Leaderboard</span><span className="font-semibold text-[#f4f4f4]">{preferences.leaderboardOptIn ? "Eligible" : "Off"}</span></div><div className="flex items-center justify-between"><span className="text-[#929292]">Token usage</span><span className="font-semibold text-[#f4f4f4]">{preferences.showTokenUsage ? "Shown" : "Hidden"}</span></div></div><Link href="/app/settings" className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[.1] px-3 text-[11px] font-semibold text-[#c8c8c8] hover:bg-white/[.06]"><ShieldCheck className="size-3.5" /> Review privacy</Link></section></div></div>

    <div className="grid gap-4 lg:grid-cols-2"><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-[#f4f4f4]">Session activity</h2><p className="mt-1 text-xs text-[#929292]">A compact view of your latest work signals.</p></div><Activity className="size-4 text-[#747474]" /></div><div className="mt-5 space-y-4">{recentSessions.slice(0, 4).map((session) => <Link key={session.sessionId} href={`/app/sessions/${session.sessionId}`} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/[.06]"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.08] text-[#e1e1e1]"><GitBranch className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#f4f4f4]">{session.archetype.primary}</span><span className="mt-1 block text-[10px] text-[#747474]">{dateText(session.startedAt)} · {formatDuration(session.activeDurationSeconds)} · {session.activity.filesTouched} files</span></span><span className="mono text-[11px] font-semibold text-[#d5d5d5]">{sessionCompositeScore(session)}</span></Link>)}{!recentSessions.length && <p className="rounded-lg bg-white/[.04] p-4 text-xs text-[#929292]">Your session activity will appear after the first import.</p>}</div></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-[#f4f4f4]">AI assistance</h2><p className="mt-1 text-xs text-[#929292]">Prompt activity stays an aggregate signal.</p></div><Bot className="size-4 text-[#747474]" /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[#1a1a1a] p-4"><p className="text-[10px] text-[#929292]">Claude Code</p><p className="mono mt-3 text-xl font-semibold text-[#f4f4f4]">{formatNumber(allTimeAggregate.ai.claudeCodePrompts)}</p><p className="mt-1 text-[10px] text-[#747474]">prompts</p></div><div className="rounded-lg bg-[#1a1a1a] p-4"><p className="text-[10px] text-[#929292]">Codex</p><p className="mono mt-3 text-xl font-semibold text-[#f4f4f4]">{formatNumber(allTimeAggregate.ai.codexPrompts)}</p><p className="mt-1 text-[10px] text-[#747474]">prompts</p></div><div className="rounded-lg bg-[#1a1a1a] p-4"><p className="text-[10px] text-[#929292]">Copilot</p><p className="mono mt-3 text-xl font-semibold text-[#f4f4f4]">{formatNumber(allTimeAggregate.ai.copilotPrompts)}</p><p className="mt-1 text-[10px] text-[#747474]">prompts</p></div></div><div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[.1] p-3 text-[10px] leading-4 text-[#929292]"><ShieldCheck className="size-3.5 shrink-0 text-[#bdbdbd]" /> Raw prompts, source code, terminal output, and secrets are never shown here.</div></section></div>

    <div className="grid gap-4 sm:grid-cols-3"><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-lg bg-white/[.08] text-[#e1e1e1]"><Trophy className="size-4" /></span><span><span className="block text-[10px] text-[#929292]">Best focus</span><span className="mono mt-1 block text-sm font-semibold text-[#f4f4f4]">{personal.bestFocus || 0}</span></span></section><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-lg bg-[#adadad]/10 text-[#d0d0d0]"><Layers3 className="size-4" /></span><span><span className="block text-[10px] text-[#929292]">Longest session</span><span className="mono mt-1 block text-sm font-semibold text-[#f4f4f4]">{formatDuration(personal.longestSessionSeconds)}</span></span></section><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-lg bg-[#707070]/20 text-[#c8c8c8]"><Zap className="size-4" /></span><span><span className="block text-[10px] text-[#929292]">Tests in one session</span><span className="mono mt-1 block text-sm font-semibold text-[#f4f4f4]">{personal.mostTestsInSession}</span></span></section></div>
  </div>;
}
