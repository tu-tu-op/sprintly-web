"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
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
  filterSessionsByRange,
  formatDuration,
  getStreakStats,
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

const panel = "rounded-[20px] border border-[#e5e7ef] bg-white shadow-[0_12px_32px_rgba(23,31,56,.045)]";

const ranges: Array<{ label: string; value: DateRange }> = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "All time", value: "all" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(Math.round(value));
const dateText = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));

function MetricCard({ icon: Icon, label, value, detail, tone, trend }: { icon: LucideIcon; label: string; value: string; detail: string; tone: "violet" | "cyan" | "green" | "orange"; trend?: string }) {
  const tones = {
    violet: "bg-[#f0edff] text-[#6958ef]",
    cyan: "bg-[#e7f8fb] text-[#1ba5b6]",
    green: "bg-[#e8f8f1] text-[#1b9b6a]",
    orange: "bg-[#fff1e8] text-[#d97938]",
  };
  return <section className={`${panel} p-5`}><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-[18px]" /></span>{trend && <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf8f1] px-2 py-1 text-[10px] font-semibold text-[#239269]"><TrendingUp className="size-3" />{trend}</span>}</div><p className="mono mt-6 text-[25px] font-semibold tracking-[-.05em] text-[#20283a]">{value}</p><p className="mt-1 text-xs font-medium text-[#626d80]">{label}</p><p className="mt-3 text-[10px] text-[#9aa2b1]">{detail}</p></section>;
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="text-[#647085]">{label}</span><span className="mono font-semibold text-[#344057]">{Math.round(value)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div></div>;
}

function ActivityChart({ data }: { data: Array<{ day: string; hours: number; edits: number }> }) {
  return <div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="sprintly-activity-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7667f5" stopOpacity={0.24} /><stop offset="100%" stopColor="#7667f5" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#eef0f5" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#98a1b2", fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#98a1b2", fontSize: 10 }} width={32} tickFormatter={(value) => `${value}h`} /><Tooltip cursor={{ stroke: "#d9ddea", strokeDasharray: "4 4" }} contentStyle={{ border: "1px solid #e5e7ef", borderRadius: 12, background: "#fff", fontSize: 11, boxShadow: "0 10px 24px rgba(23,31,56,.10)" }} formatter={(value, name) => { const numericValue = Number(value ?? 0); const metric = String(name); return [metric === "hours" ? `${numericValue.toFixed(1)}h` : formatNumber(numericValue), metric === "hours" ? "Coding time" : "Edits"]; }} /><Area type="monotone" dataKey="hours" stroke="#6d5dfc" strokeWidth={2.5} fill="url(#sprintly-activity-fill)" activeDot={{ r: 4, fill: "#6d5dfc", stroke: "#fff", strokeWidth: 2 }} /><Area type="monotone" dataKey="edits" stroke="transparent" fill="transparent" /></AreaChart></ResponsiveContainer></div>;
}

function CodingMix({ values }: { values: Array<{ name: string; value: number; color: string }> }) {
  const hasData = values.some((item) => item.value > 0);
  const chartValues = hasData ? values : [{ name: "No sessions", value: 100, color: "#e7e9f0" }];
  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center"><div className="h-[190px] w-[190px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartValues} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={hasData ? 3 : 0} stroke="none" startAngle={90} endAngle={-270}>{chartValues.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ border: "1px solid #e5e7ef", borderRadius: 12, background: "#fff", fontSize: 11 }} /></PieChart></ResponsiveContainer></div><div className="w-full space-y-4">{values.map((item) => <div key={item.name} className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-xs text-[#657085]"><span className="size-2 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="mono text-xs font-semibold text-[#344057]">{Math.round(item.value)}%</span></div>)}<div className="rounded-xl bg-[#f7f8fb] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9aa2b1]">AI balance</p><p className="mt-1 text-xs text-[#58647a]">{hasData ? "Your record keeps assistance visible without losing the human signal." : "Import a session to see your coding mix."}</p></div></div></div>;
}

function SessionTable({ sessions }: { sessions: SprintlySession[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-[#edf0f5] text-[10px] uppercase tracking-[.13em] text-[#9aa2b1]"><th className="px-5 py-3 font-semibold">Session</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Focus</th><th className="px-3 py-3 font-semibold">Duration</th><th className="px-5 py-3 text-right font-semibold">Score</th></tr></thead><tbody>{sessions.length ? sessions.map((session) => <tr key={session.sessionId} className="group border-b border-[#f0f1f5] last:border-0 hover:bg-[#fafbfe]"><td className="px-5 py-4"><Link href={`/app/sessions/${session.sessionId}`} className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f0edff] text-[#6958ef]"><Code2 className="size-4" /></span><span className="min-w-0"><span className="block max-w-[220px] truncate text-xs font-semibold text-[#2c354a]">{session.archetype.primary}</span><span className="mono mt-1 block truncate text-[10px] text-[#9aa2b1]">{session.sessionId}</span></span></Link></td><td className="px-3 py-4 text-xs text-[#6c778a]">{dateText(session.startedAt)}</td><td className="px-3 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b9b6a]"><span className="size-1.5 rounded-full bg-[#1b9b6a]" />{session.scores.focus}%</span></td><td className="mono px-3 py-4 text-xs text-[#667287]">{formatDuration(session.activeDurationSeconds)}</td><td className="mono px-5 py-4 text-right text-xs font-semibold text-[#344057]">{session.scores.devScore}</td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-xs text-[#8d97a8]">No sessions in this range yet. Import a Sprintly export to fill this table.</td></tr>}</tbody></table></div>;
}

export function Dashboard() {
  const { sessions, profile, preferences } = useSprintly();
  const [range, setRange] = useState<DateRange>("week");
  const records = useMemo(() => sessions.map((session) => session.record), [sessions]);
  const scopedRecords = useMemo(() => filterSessionsByRange(records, range), [records, range]);
  const aggregate = useMemo(() => aggregateSessions(scopedRecords), [scopedRecords]);
  const allTimeAggregate = useMemo(() => aggregateSessions(records), [records]);
  const streaks = useMemo(() => getStreakStats(records), [records]);
  const personal = useMemo(() => computePersonalRecords(records, streaks), [records, streaks]);
  const recentSessions = useMemo(() => records.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [records]);
  const activityData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (6 - index));
      const key = day.toISOString().slice(0, 10);
      const daySessions = scopedRecords.filter((session) => session.startedAt.slice(0, 10) === key);
      return { day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(day), hours: daySessions.reduce((sum, session) => sum + session.activeDurationSeconds, 0) / 3600, edits: daySessions.reduce((sum, session) => sum + session.activity.edits, 0) };
    });
  }, [scopedRecords]);
  const codingMix = [
    { name: "Manual", value: aggregate.coding.manualPercent, color: "#6d5dfc" },
    { name: "AI-assisted", value: aggregate.coding.aiAssistedPercent, color: "#22b8c9" },
    { name: "Automation", value: aggregate.coding.automationPercent, color: "#27ac78" },
  ];
  const devScore = computeCompositeDevScore(aggregate);
  const healthy = aggregate.reliability.recoveryRate >= 80 && aggregate.scores.focus >= 75;

  return <div className="space-y-6">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf8f1] px-2.5 py-1 text-[10px] font-semibold text-[#208b64]"><CircleCheck className="size-3.5" /> Private by default</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0edff] px-2.5 py-1 text-[10px] font-semibold text-[#6958ef]"><Sparkles className="size-3.5" /> {aggregate.archetype}</span></div><h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-.06em] text-[#1e2739]">Good morning, {profile.displayName.split(" ")[0]}.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#748095]">A clear view of the work you chose to record. Your focus, rhythm, and developer signals in one place.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="inline-flex rounded-xl border border-[#e1e5ed] bg-white p-1 shadow-sm">{ranges.map((item) => <button key={item.value} onClick={() => setRange(item.value)} className={`min-h-9 rounded-lg px-3 text-[11px] font-semibold transition ${range === item.value ? "bg-[#1f2738] text-white shadow-sm" : "text-[#748095] hover:bg-[#f3f4f8]"}`}>{item.label}</button>)}</div><Link href="/app/settings" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#6d5dfc] px-4 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(109,93,252,.2)] transition hover:bg-[#5e4eee]"><Sparkles className="size-3.5" /> Import data</Link></div></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={TimerReset} label="Coding time" value={formatDuration(aggregate.activeDurationSeconds)} detail={range === "week" ? "Across this week" : `Across ${aggregate.sessionCount} recorded sessions`} tone="violet" trend={aggregate.sessionCount ? `${aggregate.sessionCount} sessions` : undefined} /><MetricCard icon={Gauge} label="Focus score" value={`${aggregate.scores.focus}`} detail="Own-record score out of 100" tone="cyan" trend={aggregate.scores.focus ? `${aggregate.scores.focus}%` : undefined} /><MetricCard icon={Rocket} label="Dev Score" value={`${devScore}`} detail="Composite Sprintly v1 score" tone="green" trend={devScore ? "v1" : undefined} /><MetricCard icon={Flame} label="Current streak" value={`${streaks.current}d`} detail={`Best streak ${streaks.longest} days`} tone="orange" trend={streaks.current ? "Active" : undefined} /></div>

    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className={`${panel} p-5 sm:p-6`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#f0edff] text-[#6958ef]"><BarChart3 className="size-4" /></span><h2 className="text-sm font-semibold text-[#2a3448]">Coding activity</h2></div><p className="mt-2 text-xs text-[#8993a5]">Active coding hours across the selected range.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f8fb] px-2.5 py-1.5 text-[10px] font-medium text-[#788397]"><span className="size-2 rounded-full bg-[#6d5dfc]" /> Hours focused</span></div><div className="mt-6"><ActivityChart data={activityData} /></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#edf0f5] pt-4"><div><p className="mono text-sm font-semibold text-[#2e3950]">{formatNumber(aggregate.activity.edits)}</p><p className="mt-1 text-[10px] text-[#8993a5]">edits</p></div><div><p className="mono text-sm font-semibold text-[#2e3950]">{formatNumber(aggregate.activity.filesTouched)}</p><p className="mt-1 text-[10px] text-[#8993a5]">files touched</p></div><div><p className="mono text-sm font-semibold text-[#2e3950]">{formatNumber(aggregate.terminal.totalCommands)}</p><p className="mt-1 text-[10px] text-[#8993a5]">terminal events</p></div></div></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e7f8fb] text-[#1ba5b6]"><Code2 className="size-4" /></span><h2 className="text-sm font-semibold text-[#2a3448]">Coding mix</h2></div><p className="mt-2 text-xs text-[#8993a5]">How this record was produced.</p></div><button aria-label="More coding mix options" className="grid size-8 place-items-center rounded-lg text-[#9aa2b1] hover:bg-[#f5f6fa]"><MoreHorizontal className="size-4" /></button></div><div className="mt-5"><CodingMix values={codingMix} /></div></section></div>

    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold text-[#2a3448]">Recent sessions</h2><p className="mt-1 text-xs text-[#8993a5]">The latest records in your Sprintly history.</p></div><Link href="/app/sessions" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6958ef]">View all <ChevronRight className="size-3.5" /></Link></div><SessionTable sessions={recentSessions.slice(0, 5)} /></section><div className="space-y-4"><section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-[#2a3448]">Momentum health</h2><p className="mt-1 text-xs text-[#8993a5]">Signals that shape your progress.</p></div><span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", healthy ? "bg-[#eaf8f1] text-[#208b64]" : "bg-[#fff1e8] text-[#c46d33]")}>{healthy ? "Healthy" : "Needs a reset"}</span></div><div className="mt-6 space-y-5"><ProgressRow label="Focus" value={aggregate.scores.focus} color="#6d5dfc" /><ProgressRow label="Testing discipline" value={aggregate.scores.testingDiscipline} color="#22b8c9" /><ProgressRow label="Recovery" value={aggregate.reliability.recoveryRate} color="#27ac78" /><ProgressRow label="Consistency" value={aggregate.scores.consistency} color="#ee984d" /></div><Link href="/app/analytics" className="mt-6 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6958ef]">Open recap <ArrowUpRight className="size-3.5" /></Link></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff1e8] text-[#d97938]"><ShieldCheck className="size-4" /></span><div><h2 className="text-sm font-semibold text-[#2a3448]">Data boundary</h2><p className="mt-1 text-[10px] text-[#8993a5]">Your sharing controls</p></div></div><div className="mt-5 space-y-3 text-xs"><div className="flex items-center justify-between"><span className="text-[#748095]">Profile visibility</span><span className="font-semibold text-[#2e3950]">{preferences.profileVisibility === "public" ? "Public" : "Private"}</span></div><div className="flex items-center justify-between"><span className="text-[#748095]">Leaderboard</span><span className="font-semibold text-[#2e3950]">{preferences.leaderboardOptIn ? "Eligible" : "Off"}</span></div><div className="flex items-center justify-between"><span className="text-[#748095]">Token usage</span><span className="font-semibold text-[#2e3950]">{preferences.showTokenUsage ? "Shown" : "Hidden"}</span></div></div><Link href="/app/settings" className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#e2e5ed] px-3 text-[11px] font-semibold text-[#5f6b80] hover:bg-[#f7f8fb]"><ShieldCheck className="size-3.5" /> Review privacy</Link></section></div></div>

    <div className="grid gap-4 lg:grid-cols-2"><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-[#2a3448]">Session activity</h2><p className="mt-1 text-xs text-[#8993a5]">A compact view of your latest work signals.</p></div><Activity className="size-4 text-[#9aa2b1]" /></div><div className="mt-5 space-y-4">{recentSessions.slice(0, 4).map((session) => <Link key={session.sessionId} href={`/app/sessions/${session.sessionId}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f7f8fb]"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0edff] text-[#6958ef]"><GitBranch className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#3a455a]">{session.archetype.primary}</span><span className="mt-1 block text-[10px] text-[#929bad]">{dateText(session.startedAt)} · {formatDuration(session.activeDurationSeconds)} · {session.activity.filesTouched} files</span></span><span className="mono text-[11px] font-semibold text-[#58647a]">{session.scores.devScore}</span></Link>)}{!recentSessions.length && <p className="rounded-xl bg-[#f7f8fb] p-4 text-xs text-[#8993a5]">Your session activity will appear after the first import.</p>}</div></section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-[#2a3448]">AI assistance</h2><p className="mt-1 text-xs text-[#8993a5]">Prompt activity stays an aggregate signal.</p></div><Bot className="size-4 text-[#9aa2b1]" /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f7f8fb] p-4"><p className="text-[10px] text-[#8993a5]">Claude Code</p><p className="mono mt-3 text-xl font-semibold text-[#2e3950]">{formatNumber(allTimeAggregate.ai.claudeCodePrompts)}</p><p className="mt-1 text-[10px] text-[#8993a5]">prompts</p></div><div className="rounded-xl bg-[#f7f8fb] p-4"><p className="text-[10px] text-[#8993a5]">Codex</p><p className="mono mt-3 text-xl font-semibold text-[#2e3950]">{formatNumber(allTimeAggregate.ai.codexPrompts)}</p><p className="mt-1 text-[10px] text-[#8993a5]">prompts</p></div><div className="rounded-xl bg-[#f7f8fb] p-4"><p className="text-[10px] text-[#8993a5]">Copilot</p><p className="mono mt-3 text-xl font-semibold text-[#2e3950]">{formatNumber(allTimeAggregate.ai.copilotPrompts)}</p><p className="mt-1 text-[10px] text-[#8993a5]">prompts</p></div></div><div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e5e7ef] p-3 text-[10px] leading-4 text-[#788397]"><ShieldCheck className="size-3.5 shrink-0 text-[#1b9b6a]" /> Raw prompts, source code, terminal output, and secrets are never shown here.</div></section></div>

    <div className="grid gap-4 sm:grid-cols-3"><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-xl bg-[#f0edff] text-[#6958ef]"><Trophy className="size-4" /></span><span><span className="block text-[10px] text-[#8993a5]">Best focus</span><span className="mono mt-1 block text-sm font-semibold text-[#2e3950]">{personal.bestFocus || 0}</span></span></section><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-xl bg-[#e7f8fb] text-[#1ba5b6]"><Layers3 className="size-4" /></span><span><span className="block text-[10px] text-[#8993a5]">Longest session</span><span className="mono mt-1 block text-sm font-semibold text-[#2e3950]">{formatDuration(personal.longestSessionSeconds)}</span></span></section><section className={`${panel} flex items-center gap-3 p-4`}><span className="grid size-9 place-items-center rounded-xl bg-[#e8f8f1] text-[#1b9b6a]"><Zap className="size-4" /></span><span><span className="block text-[10px] text-[#8993a5]">Tests in one session</span><span className="mono mt-1 block text-sm font-semibold text-[#2e3950]">{personal.mostTestsInSession}</span></span></section></div>
  </div>;
}
