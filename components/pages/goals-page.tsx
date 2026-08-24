"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  Archive,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Blocks,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Cloud,
  Code2,
  CreditCard,
  Download,
  Eye,
  FileCode2,
  FileUp,
  Filter,
  Flame,
  Focus,
  Gauge,
  GitBranch,
  Globe2,
  Grid2X2,
  HardDrive,
  History,
  List,
  LockKeyhole,
  Medal,
  Monitor,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Square,
  Sun,
  Target,
  TerminalSquare,
  Timer,
  Trophy,
  Upload,
  UserRound,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSprintlyStore } from "@/lib/store";

const enter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.header
      {...enter}
      className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 xl:flex-row xl:items-end"
    >
      <div>
        <p className="mono text-[11px] uppercase tracking-[.17em] text-[#7d7d7d]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-.045em] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b8b8b]">
          {description}
        </p>
      </div>
      {action}
    </motion.header>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section {...enter} className={`panel ${className}`}>
      {children}
    </motion.section>
  );
}

function Tag({
  children,
  color = "violet",
}: {
  children: React.ReactNode;
  color?: "violet" | "green" | "amber" | "cyan" | "gray";
}) {
  const c = {
    violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]",
    green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/8 text-[#e0e0e0]",
    amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/8 text-[#c2c2c2]",
    cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/8 text-[#c7c7c7]",
    gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${c[color]}`}
    >
      {children}
    </span>
  );
}

function Progress({
  value,
  color = "#f2f2f2",
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-[#939393]">{label}</span>
          <span className="mono text-[#d7d7d7]">{value}%</span>
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/[.06]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

type Task = {
  id: number;
  title: string;
  project: string;
  priority: "High" | "Medium" | "Low";
  status: "Backlog" | "In progress" | "Review" | "Done";
  due: string;
  sub: string;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Refine session activity timeline",
    project: "Sprintly web",
    priority: "High",
    status: "In progress",
    due: "Today",
    sub: "3/5",
  },
  {
    id: 2,
    title: "Add extension reconnect state",
    project: "VS Code extension",
    priority: "High",
    status: "Review",
    due: "Today",
    sub: "4/4",
  },
  {
    id: 3,
    title: "Define leaderboard consent copy",
    project: "Sprintly web",
    priority: "Medium",
    status: "Backlog",
    due: "Aug 16",
    sub: "1/3",
  },
  {
    id: 4,
    title: "Instrument local archive export",
    project: "Core",
    priority: "Medium",
    status: "In progress",
    due: "Aug 17",
    sub: "2/6",
  },
  {
    id: 5,
    title: "Polish achievement reveal",
    project: "Sprintly web",
    priority: "Low",
    status: "Done",
    due: "Aug 13",
    sub: "4/4",
  },
  {
    id: 6,
    title: "Session recovery edge cases",
    project: "VS Code extension",
    priority: "High",
    status: "Backlog",
    due: "Aug 18",
    sub: "0/5",
  },
];

const sessions = [
  {
    id: "today",
    project: "sprintly-web",
    task: "Dashboard navigation",
    date: "Today",
    time: "14:12—16:25",
    duration: "2h 13m",
    focus: 87,
    files: 14,
    edits: 386,
    term: 22,
  },
  {
    id: "aug-13",
    project: "vscode-extension",
    task: "Reconnect state",
    date: "Yesterday",
    time: "09:08—11:42",
    duration: "2h 34m",
    focus: 92,
    files: 9,
    edits: 512,
    term: 31,
  },
  {
    id: "aug-12",
    project: "sprintly-api",
    task: "Sync boundary",
    date: "Aug 12",
    time: "19:24—21:05",
    duration: "1h 41m",
    focus: 78,
    files: 11,
    edits: 294,
    term: 18,
  },
  {
    id: "aug-11",
    project: "sprintly-web",
    task: "Achievement states",
    date: "Aug 11",
    time: "15:10—18:22",
    duration: "3h 12m",
    focus: 84,
    files: 23,
    edits: 644,
    term: 46,
  },
];

const goals = [
  {
    title: "20 focused hours",
    type: "Weekly",
    value: 92,
    color: "#d0d0d0",
    detail: "18h 24m · 1h 36m left",
    due: "Ends Sunday",
  },
  {
    title: "Complete activity timeline",
    type: "Sprint",
    value: 68,
    color: "#f2f2f2",
    detail: "7 of 10 tasks",
    due: "2 days left",
  },
  {
    title: "30-day consistency",
    type: "Long term",
    value: 40,
    color: "#9a9a9a",
    detail: "12 of 30 days",
    due: "18 days left",
  },
  {
    title: "One deep session daily",
    type: "Daily",
    value: 100,
    color: "#bdbdbd",
    detail: "2h 13m completed",
    due: "Complete",
  },
];

export function GoalsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Goals & sprints"
        title="Turn intention into momentum."
        description="Set goals around consistency and outcomes—not passive screen time."
        action={
          <button
            onClick={() => toast.success("Goal draft opened")}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold"
          >
            <Plus className="size-4" /> Create goal
          </button>
        }
      />
      <Panel className="mb-3 overflow-hidden p-5 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Tag color="violet">
              <Zap className="size-3" /> Sprint 08 · strong momentum
            </Tag>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-.05em]">
              Ship activity timeline
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#8b8b8b]">
              A 10-task product sprint connected to 8 focused sessions and 11h
              42m of work.
            </p>
            <div className="mt-7 flex gap-8">
              <div>
                <p className="mono text-2xl font-semibold">68%</p>
                <p className="mt-1 text-xs text-[#7a7a7a]">progress</p>
              </div>
              <div>
                <p className="mono text-2xl font-semibold">2d</p>
                <p className="mt-1 text-xs text-[#7a7a7a]">remaining</p>
              </div>
              <div>
                <p className="mono text-2xl font-semibold">7/10</p>
                <p className="mt-1 text-xs text-[#7a7a7a]">tasks</p>
              </div>
            </div>
          </div>
          <div>
            <div className="relative h-3 overflow-hidden rounded-full bg-white/[.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "68%" }}
                className="h-full rounded-full bg-gradient-to-r from-[#f2f2f2] to-[#bdbdbd]"
              />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((m, i) => (
                <div
                  key={m}
                  className={`rounded-lg border p-3 text-center ${i < 3 ? "border-[#f2f2f2]/20 bg-[#f2f2f2]/8" : "border-white/[.07] bg-white/[.02]"}`}
                >
                  <CheckCircle2
                    className={`mx-auto size-4 ${i < 3 ? "text-[#d2d2d2]" : "text-[#5b5b5b]"}`}
                  />
                  <p className="mono mt-2 text-[9px] text-[#787878]">M{m}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-[#7d7d7d]">
              <span>Foundation</span>
              <span>Polish & ship</span>
            </div>
          </div>
        </div>
      </Panel>
      <div className="grid gap-3 md:grid-cols-2">
        {goals.map((g) => (
          <Panel key={g.title} className="p-5">
            <div className="flex justify-between">
              <Tag
                color={
                  g.type === "Daily"
                    ? "cyan"
                    : g.type === "Weekly"
                      ? "green"
                      : g.type === "Sprint"
                        ? "violet"
                        : "amber"
                }
              >
                {g.type}
              </Tag>
              <button
                aria-label={`Options for ${g.title}`}
                className="grid size-9 place-items-center rounded-lg text-[#6e6e6e]"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
            <h2 className="mt-6 text-lg font-semibold tracking-[-.025em]">
              {g.title}
            </h2>
            <p className="mt-2 text-xs text-[#838383]">{g.detail}</p>
            <div className="mt-6">
              <Progress value={g.value} color={g.color} />
            </div>
            <div className="mt-4 flex justify-between text-[11px] text-[#797979]">
              <span>{g.value}% complete</span>
              <span>{g.due}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
