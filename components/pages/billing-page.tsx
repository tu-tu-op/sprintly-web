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

export function BillingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Subscription"
        title="Billing"
        description="Plan, usage, invoices, and payment method."
        action={
          <button className="inline-flex min-h-11 items-center rounded-lg border border-white/[.08] px-4 text-sm text-[#cacaca]">
            Billing help
          </button>
        }
      />
      <Panel className="relative overflow-hidden border-[#f2f2f2]/25 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(128,128,128,.18),transparent_60%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Tag color="violet">
              <Zap className="size-3" /> Premium
            </Tag>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-.05em]">
              Your full developer history, in motion.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#8c8c8c]">
              Advanced analytics, unlimited synchronized history, goals, share
              cards, and optional insights.
            </p>
            <div className="mt-7 flex flex-wrap gap-6">
              {[
                ["184h", "synced focus"],
                ["86%", "focus score"],
                ["14/∞", "sessions this week"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="mono text-xl font-semibold">{v}</p>
                  <p className="mt-1 text-[10px] text-[#797979]">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:text-right">
            <p className="mono text-4xl font-semibold">
              $8
              <span className="text-sm font-normal text-[#797979]"> / mo</span>
            </p>
            <p className="mt-2 text-xs text-[#7d7d7d]">Renews September 14</p>
            <button className="mt-5 min-h-11 rounded-lg border border-white/10 px-4 text-sm text-[#cccccc]">
              Manage plan
            </button>
          </div>
        </div>
      </Panel>
      <div className="mt-3 grid gap-3 xl:grid-cols-[.75fr_1.25fr]">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Payment method</h2>
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-white/[.07] bg-white/[.02] p-4">
            <div className="grid size-10 place-items-center rounded-lg bg-white/[.05]">
              <CreditCard className="size-4 text-[#d2d2d2]" />
            </div>
            <div>
              <p className="text-sm font-medium">•••• 4242</p>
              <p className="mt-1 text-xs text-[#7a7a7a]">Expires 08/29</p>
            </div>
            <button className="ml-auto text-xs text-[#c2c2c2]">Update</button>
          </div>
          <h2 className="mt-7 text-sm font-semibold">Usage</h2>
          <div className="mt-4">
            <Progress label="Cloud archive" value={36} />
          </div>
          <p className="mt-3 text-[11px] text-[#797979]">
            1.8 GB of 5 GB included
          </p>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="border-b border-white/[.07] p-5">
            <h2 className="text-sm font-semibold">Invoices</h2>
          </div>
          {[
            ["Aug 14, 2026", "Sprintly Premium", "$8.00", "Paid"],
            ["Jul 14, 2026", "Sprintly Premium", "$8.00", "Paid"],
            ["Jun 14, 2026", "Sprintly Premium", "$8.00", "Paid"],
          ].map(([d, p, a, s]) => (
            <div
              key={d}
              className="grid min-h-[68px] grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[.06] px-5 last:border-0 sm:grid-cols-[140px_1fr_80px_80px_40px]"
            >
              <span className="text-xs text-[#838383]">{d}</span>
              <span className="hidden text-xs sm:block">{p}</span>
              <span className="mono text-xs">{a}</span>
              <Tag color="green">{s}</Tag>
              <button
                aria-label={`Download invoice from ${d}`}
                className="grid size-9 place-items-center rounded-lg text-[#7a7a7a]"
              >
                <Download className="size-4" />
              </button>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
