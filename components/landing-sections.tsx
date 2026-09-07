"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowRight, Award, BarChart3, Binary, Bot, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock, Cloud, Code2, Cpu, Database, EyeOff,
  FileCode2, Flame, Gauge, GitBranch, Globe2, HardDrive, KeyRound, Laptop,
  Layers, LockKeyhole, Play, RefreshCw, Server, Shield, ShieldAlert,
  ShieldCheck, Sparkles, TerminalSquare, TimerReset, Trophy, Users, Zap
} from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

export function StatusPill({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "violet" | "amber" | "gray" | "cyan";
}) {
  const colors = {
    green: "border-[#36C98F]/30 bg-[#36C98F]/10 text-[#36C98F]",
    violet: "border-[#7C6CF2]/35 bg-[#7C6CF2]/10 text-[#9B8CFF]",
    amber: "border-[#F6A94A]/30 bg-[#F6A94A]/10 text-[#F6A94A]",
    cyan: "border-[#32C7D9]/30 bg-[#32C7D9]/10 text-[#32C7D9]",
    gray: "border-white/10 bg-white/[.04] text-[#a5a5a5]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

/* =========================================================================
   1. INTERACTIVE TELEMETRY STUDIO (Live SaaS Interactive Demo)
   ========================================================================= */

type StudioTab = "sensor" | "devscore" | "circadian" | "privacy";

export function InteractiveStudioSection() {
  const [activeTab, setActiveTab] = useState<StudioTab>("sensor");

  return (
    <section className="relative border-b border-white/[.07] bg-[#09090b] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        {/* Header */}
        <motion.div {...reveal} className="max-w-3xl">
          <div className="flex items-center gap-2">
            <StatusPill tone="violet">
              <Cpu className="size-3.5" /> Interactive Product Studio
            </StatusPill>
            <span className="mono text-xs text-[#6e6e6e]">v1.0.4 SPEC</span>
          </div>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Inside the Sprintly engine.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#999999] sm:text-lg">
            Experience the actual telemetry models, scoring algorithms, and privacy boundaries that power Sprintly’s developer productivity operating system.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-white/[.07] pb-4">
          {[
            { id: "sensor" as StudioTab, label: "VS Code Sensor & Stream", icon: TerminalSquare },
            { id: "devscore" as StudioTab, label: "DevScore™ & Archetypes", icon: Award },
            { id: "circadian" as StudioTab, label: "Circadian Rhythm Matrix", icon: Clock },
            { id: "privacy" as StudioTab, label: "Zero-Knowledge Perimeter", icon: LockKeyhole },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                activeTab === id
                  ? "border-[#7C6CF2]/60 bg-[#7C6CF2]/15 text-[#f4f4f4] shadow-[0_0_24px_rgba(124,108,242,0.15)]"
                  : "border-white/[.06] bg-white/[.02] text-[#888888] hover:border-white/15 hover:bg-white/[.04] hover:text-[#d0d0d0]"
              }`}
            >
              <Icon className={`size-4 ${activeTab === id ? "text-[#9B8CFF]" : "text-[#777777]"}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Dynamic Studio Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === "sensor" && <SensorStreamMock key="sensor" />}
            {activeTab === "devscore" && <DevScoreEngineMock key="devscore" />}
            {activeTab === "circadian" && <CircadianMatrixMock key="circadian" />}
            {activeTab === "privacy" && <PrivacyPerimeterMock key="privacy" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function SensorStreamMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="panel grid gap-6 p-6 lg:grid-cols-[1.3fr_1fr] lg:p-8"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#36C98F] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#36C98F]" />
            </span>
            <span className="mono text-xs font-semibold uppercase tracking-wider text-[#e6e6e6]">
              devstrava.session.v1 / live telemetry
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono text-xs text-[#888888]">SESSION:</span>
            <span className="mono rounded bg-white/[.05] px-2 py-0.5 text-xs text-[#9B8CFF]">
              sess_94f82a1c
            </span>
          </div>
        </div>

        {/* Real-time telemetry feed */}
        <div className="mt-5 space-y-2 font-mono text-xs">
          {[
            { time: "00:14:02", type: "BUILD", event: "tsc --noEmit", status: "OK (0 errors)", color: "text-[#36C98F]" },
            { time: "00:14:38", type: "GIT", event: "git commit -m 'feat(auth): token pairing'", status: "SHA a83f21", color: "text-[#32C7D9]" },
            { time: "00:16:11", type: "TEST", event: "pnpm test:sprintly (18 passed, 0 failed)", status: "100% RECOVERY", color: "text-[#36C98F]" },
            { time: "00:18:45", type: "EDIT", event: "lib/sprintly/scoring.ts (+42 lines)", status: "MANUAL 84%", color: "text-[#F6A94A]" },
            { time: "00:21:04", type: "AI", event: "copilot.inline_completion accepted", status: "16% AI ASSIST", color: "text-[#9B8CFF]" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between rounded-lg border border-white/[.04] bg-black/40 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#666666]">{item.time}</span>
                <span className="rounded bg-white/[.06] px-1.5 py-0.5 text-[10px] font-semibold text-[#c0c0c0]">
                  {item.type}
                </span>
                <span className="text-[#d8d8d8]">{item.event}</span>
              </div>
              <span className={`text-[11px] font-medium ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-[#36C98F]/20 bg-[#36C98F]/[0.03] p-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#36C98F]" />
            <div>
              <p className="font-medium text-[#e4e4e4]">Zero Source Code Capture Verified</p>
              <p className="mt-0.5 text-[#888888]">Editor buffer text, file contents, secrets, and AST branches are discarded before aggregation.</p>
            </div>
          </div>
          <StatusPill tone="green">Air-Gapped Safe</StatusPill>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="flex flex-col justify-between gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
            <span className="mono text-[10px] uppercase tracking-wider text-[#777777]">ACTIVE DURATION</span>
            <p className="mono mt-2 text-2xl font-semibold text-[#f4f4f4]">01h 48m</p>
            <p className="mt-1 text-xs text-[#36C98F]">Continuous focus block</p>
          </div>
          <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
            <span className="mono text-[10px] uppercase tracking-wider text-[#777777]">COMMANDS LOGGED</span>
            <p className="mono mt-2 text-2xl font-semibold text-[#f4f4f4]">47</p>
            <p className="mt-1 text-xs text-[#9B8CFF]">18 tests · 14 git · 15 dev</p>
          </div>
          <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
            <span className="mono text-[10px] uppercase tracking-wider text-[#777777]">FILES TOUCHED</span>
            <p className="mono mt-2 text-2xl font-semibold text-[#f4f4f4]">12</p>
            <p className="mt-1 text-xs text-[#888888]">Across 3 workspaces</p>
          </div>
          <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
            <span className="mono text-[10px] uppercase tracking-wider text-[#777777]">AI ASSIST BALANCE</span>
            <p className="mono mt-2 text-2xl font-semibold text-[#f4f4f4]">24%</p>
            <p className="mt-1 text-xs text-[#32C7D9]">76% manual craftsmanship</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/[.07] bg-[#0c0c0e] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#999999]">Session Integrity Hash</span>
            <span className="mono text-[#7C6CF2]">SHA-256 (Signed)</span>
          </div>
          <div className="mono mt-2 overflow-hidden text-ellipsis rounded bg-black/50 p-2 text-[11px] text-[#777777]">
            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
          <p className="mt-2 text-[11px] text-[#666666]">
            Every session generates an immutable signature locally before persistence.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DevScoreEngineMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="panel grid gap-8 p-6 lg:grid-cols-[1.1fr_1.4fr] lg:p-8"
    >
      {/* Archetype Identity Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#7C6CF2]/30 bg-gradient-to-b from-[#7C6CF2]/10 via-[#0d0f14] to-[#0a0a0c] p-6">
        <div className="flex items-center justify-between">
          <StatusPill tone="violet">
            <Sparkles className="size-3.5" /> Archetype Profile
          </StatusPill>
          <span className="mono text-xs text-[#8e8e8e]">TIER: ELITE</span>
        </div>

        <div className="mt-6">
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-[#9B8CFF]">
            PRIMARY ARCHETYPE
          </span>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#f4f4f4] sm:text-3xl">
            Terminal Architect
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#a0a0a0]">
            Characterized by autonomous build-and-test loops, disciplined git chunking, and high resilience under failing test conditions.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {["High Test Discipline", "Sub-Second Recovery", "Zero-Bloat Commits", "Deep Flow (90m+)"].map((trait) => (
            <span
              key={trait}
              className="rounded-md border border-white/[.08] bg-white/[.04] px-2.5 py-1 text-[11px] text-[#c2c2c2]"
            >
              {trait}
            </span>
          ))}
        </div>

        <div className="mt-8 border-t border-white/[.08] pt-5">
          <div className="flex items-end justify-between">
            <div>
              <span className="mono text-[10px] uppercase text-[#777777]">CUMULATIVE DEVSCORE</span>
              <p className="mono text-4xl font-bold text-[#f4f4f4]">874<span className="text-sm font-normal text-[#666666]"> / 1000</span></p>
            </div>
            <span className="mono rounded-full border border-[#36C98F]/30 bg-[#36C98F]/10 px-3 py-1 text-xs font-semibold text-[#36C98F]">
              TOP 3.4%
            </span>
          </div>
        </div>
      </div>

      {/* Scoring Engine Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[.07] pb-3">
          <h4 className="text-sm font-semibold text-[#f4f4f4]">Algorithmic Scoring Vectors</h4>
          <span className="mono text-xs text-[#777777]">WEIGHTED COMPOSITE</span>
        </div>

        {[
          { label: "Testing Discipline", score: 94, desc: "Frequency of test executions per code modification cycle", color: "bg-[#36C98F]" },
          { label: "Focus Depth & Continuity", score: 88, desc: "Unbroken editor engagement without context switching", color: "bg-[#7C6CF2]" },
          { label: "Error Recovery Velocity", score: 92, desc: "Rate of transitioning from red (failed build/test) to green", color: "bg-[#32C7D9]" },
          { label: "Consistency & Cadence", score: 85, desc: "Sustained rhythm across multi-day sprint cycles", color: "bg-[#F6A94A]" },
          { label: "AI Collaboration Ratio", score: 80, desc: "Balanced synergy between manual craft and AI synthesis", color: "bg-[#9B8CFF]" },
        ].map((vector) => (
          <div key={vector.label} className="rounded-xl border border-white/[.05] bg-white/[.02] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#dcdcdc]">{vector.label}</span>
              <span className="mono font-semibold text-[#f4f4f4]">{vector.score}/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
              <div className={`h-full rounded-full ${vector.color}`} style={{ width: `${vector.score}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-[#777777]">{vector.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CircadianMatrixMock() {
  const hours = [
    { hr: "06", val: 12 }, { hr: "07", val: 24 }, { hr: "08", val: 45 },
    { hr: "09", val: 82 }, { hr: "10", val: 96 }, { hr: "11", val: 89 },
    { hr: "12", val: 40 }, { hr: "13", val: 55 }, { hr: "14", val: 78 },
    { hr: "15", val: 92 }, { hr: "16", val: 84 }, { hr: "17", val: 62 },
    { hr: "18", val: 30 }, { hr: "19", val: 25 }, { hr: "20", val: 68 },
    { hr: "21", val: 88 }, { hr: "22", val: 74 }, { hr: "23", val: 42 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="panel p-6 lg:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.07] pb-5">
        <div>
          <h4 className="text-base font-semibold text-[#f4f4f4]">Chrono-Focus Heatmap & Cognitive Peak</h4>
          <p className="mt-1 text-xs text-[#888888]">Aggregated hourly productivity curve computed from 40+ local sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill tone="cyan">Peak Window: 09:30 - 11:45</StatusPill>
          <StatusPill tone="amber">Secondary: 20:30 - 22:15</StatusPill>
        </div>
      </div>

      {/* Hourly Bar Curve */}
      <div className="mt-8">
        <div className="flex h-36 items-end gap-1.5 sm:gap-2.5">
          {hours.map((h, i) => {
            const isPeak = h.val >= 85;
            return (
              <div key={h.hr} className="group relative flex flex-1 flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-200 group-hover:brightness-125 ${
                    isPeak
                      ? "bg-gradient-to-t from-[#7C6CF2]/60 to-[#9B8CFF]"
                      : h.val > 50
                      ? "bg-[#454545]"
                      : "bg-[#252525]"
                  }`}
                  style={{ height: `${h.val}%` }}
                />
                <span className="mono mt-2 text-[9px] text-[#666666] sm:text-[10px]">{h.hr}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-by-Day Consistency Grid */}
      <div className="mt-8 grid gap-3 border-t border-white/[.07] pt-6 sm:grid-cols-4">
        {[
          { label: "Total Deep Hours", val: "38.5 hrs", note: "+4.2 hrs vs last week" },
          { label: "Optimal Flow Interval", val: "102 mins", note: "Average uninterrupted focus" },
          { label: "Context Switching Cost", val: "14%", note: "Lowest in team cohort" },
          { label: "Weekly Consistency", val: "94.2%", note: "12 consecutive active days" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3.5">
            <span className="mono text-[10px] uppercase text-[#777777]">{item.label}</span>
            <p className="mono mt-1 text-xl font-semibold text-[#f4f4f4]">{item.val}</p>
            <p className="mt-0.5 text-[11px] text-[#36C98F]">{item.note}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PrivacyPerimeterMock() {
  const [level, setLevel] = useState<"local" | "synced" | "public">("local");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="panel p-6 lg:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.07] pb-5">
        <div>
          <h4 className="text-base font-semibold text-[#f4f4f4]">Three-Tier Zero-Knowledge Residency Model</h4>
          <p className="mt-1 text-xs text-[#888888]">Inspect what data exists in each layer and how cryptographic boundaries prevent leakage.</p>
        </div>
        <div className="flex gap-2">
          {(["local", "synced", "public"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                level === l
                  ? "border-[#f4f4f4] bg-[#f4f4f4] text-[#09090b]"
                  : "border-white/10 bg-white/[.03] text-[#999999] hover:bg-white/[.06]"
              }`}
            >
              {l === "local" ? "1. Local Only" : l === "synced" ? "2. Cloud Synced" : "3. Public Card"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h5 className="mono text-xs uppercase tracking-wider text-[#999999]">Data Ingress / Egress Status</h5>
          {level === "local" && (
            <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#36C98F] font-medium">
                <HardDrive className="size-4" /> 100% Resident on Client Machine
              </div>
              <p className="text-xs text-[#999999] leading-5">
                All metrics are stored exclusively in local SQLite / IndexedDB. Zero outbound HTTP requests are initiated. Full exportable JSON format.
              </p>
              <ul className="space-y-1.5 text-xs text-[#bbbbbb]">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#36C98F]" /> Local session history & streaks</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#36C98F]" /> Terminal command classifications</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#36C98F]" /> Manual vs AI balance telemetry</li>
                <li className="flex items-center gap-2 text-[#F06464]"><EyeOff className="size-3.5" /> No account or network connection required</li>
              </ul>
            </div>
          )}

          {level === "synced" && (
            <div className="rounded-xl border border-[#7C6CF2]/30 bg-[#7C6CF2]/[0.04] p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#9B8CFF] font-medium">
                <Cloud className="size-4" /> Authenticated Supabase Cloud Vault
              </div>
              <p className="text-xs text-[#999999] leading-5">
                Only aggregate session metadata is encrypted and pushed via paired token. Allows continuous streak tracking across work laptop and home desktop.
              </p>
              <ul className="space-y-1.5 text-xs text-[#bbbbbb]">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#9B8CFF]" /> Multi-device session aggregation</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#9B8CFF]" /> Cloud backup with granular wipe controls</li>
                <li className="flex items-center gap-2 text-[#F6A94A]"><LockKeyhole className="size-3.5" /> Raw file paths and code strictly omitted</li>
              </ul>
            </div>
          )}

          {level === "public" && (
            <div className="rounded-xl border border-[#F6A94A]/30 bg-[#F6A94A]/[0.04] p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#F6A94A] font-medium">
                <Globe2 className="size-4" /> Opt-In Public Showcase
              </div>
              <p className="text-xs text-[#999999] leading-5">
                Only your verified DevScore, archetype badges, and anonymous leaderboard standing are published. Never displays project names or timestamps.
              </p>
              <ul className="space-y-1.5 text-xs text-[#bbbbbb]">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#F6A94A]" /> Verifiable public share link (/share/id)</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-[#F6A94A]" /> Community leaderboard rank</li>
                <li className="flex items-center gap-2 text-[#36C98F]"><ShieldCheck className="size-3.5" /> Granular instant toggle to make private</li>
              </ul>
            </div>
          )}
        </div>

        {/* JSON Schema Payload Viewer */}
        <div className="rounded-xl border border-white/[.08] bg-[#050507] p-4">
          <div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-xs">
            <span className="mono text-[#888888]">CONTRACT PAYLOAD INSPECTOR</span>
            <span className="mono text-[10px] text-[#36C98F]">devstrava.session.v1</span>
          </div>
          <pre className="mono mt-3 max-h-56 overflow-y-auto text-[11px] leading-5 text-[#a8a8a8]">
            {level === "local" && `{\n  "schemaVersion": 1,\n  "sessionId": "sess_loc_09182",\n  "activeDurationSeconds": 6480,\n  "coding": {\n    "manualPercent": 78.4,\n    "aiAssistedPercent": 21.6\n  },\n  "terminal": {\n    "test": 12, "git": 6, "build": 4\n  },\n  "scores": {\n    "focus": 88, "devScore": 874\n  }\n}`}
            {level === "synced" && `{\n  "contract": "devstrava.session.v1",\n  "deviceId": "vscode-sha256-d8f92",\n  "totalSessions": 42,\n  "weeklyActiveMinutes": 1840,\n  "syncTimestamp": "2026-09-08T05:00:00Z",\n  "signature": "3f82a9...d4c1"\n}`}
            {level === "public" && `{\n  "handle": "alex_dev",\n  "archetype": "Terminal Architect",\n  "devScore": 874,\n  "streakDays": 14,\n  "publicBadges": ["clean_exit", "flow_90m"]\n}`}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   2. THE SENSOR PIPELINE & ARCHITECTURE DEEP DIVE
   ========================================================================= */

export function ArchitecturePipelineSection() {
  const steps = [
    {
      num: "01",
      title: "VS Code Protocol Handshake",
      desc: "Connect via one-click URI `vscode://tu-tu-op.sprintly/connect`. The server mints a single-use pairing code, and the extension stores a cryptographically secure token in the OS secret keychain.",
      badge: "Cryptographic Pairing",
    },
    {
      num: "02",
      title: "Zero-AST Aggregate Sensing",
      desc: "Sprintly registers lightweight listeners for editor buffer swaps, edit volume, and exit codes of terminal executions. It never parses abstract syntax trees, never captures variables, and ignores file text.",
      badge: "Pure Aggregate",
    },
    {
      num: "03",
      title: "RFC 3339 Canonicalization",
      desc: "All session intervals are normalized with explicit UTC timezone offsets. This eliminates time-zone drift when traveling and guarantees consistent calendar streak calculations.",
      badge: "Deterministic Time",
    },
    {
      num: "04",
      title: "Strict 1MB Payload Envelope",
      desc: "Batched uploads enforce strict Zod schemas, 100-session batch limits, and server-side recomputation of DevScore. Retries are idempotent via unique (user_id, session_id) constraints.",
      badge: "Zero Replay Attack",
    },
  ];

  return (
    <section className="border-b border-white/[.07] bg-[#070709] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <motion.div {...reveal} className="max-w-2xl">
          <StatusPill tone="cyan">
            <Binary className="size-3.5" /> Technical Architecture
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Engineered for engineers who care about security.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#959595]">
            Sprintly was designed from day zero with zero-trust principles. See how telemetry flows safely from your editor to your personal dashboard.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              {...reveal}
              transition={{ delay: idx * 0.08 }}
              className="panel relative flex flex-col justify-between p-6 transition hover:border-white/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="mono text-2xl font-bold text-[#444444]">{step.num}</span>
                  <span className="mono rounded bg-white/[.05] px-2 py-0.5 text-[10px] text-[#9B8CFF]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#f4f4f4]">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#8e8e8e]">{step.desc}</p>
              </div>
              <div className="mt-6 border-t border-white/[.05] pt-4">
                <span className="mono text-[10px] text-[#555555]">PIPELINE PHASE {idx + 1}/4</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What We Track vs What We Never Track Table */}
        <motion.div {...reveal} className="mt-12 panel overflow-hidden p-6 sm:p-8">
          <div className="border-b border-white/[.07] pb-4">
            <h3 className="text-lg font-semibold text-[#f4f4f4]">Data Ingestion Boundary Matrix</h3>
            <p className="mt-1 text-xs text-[#888888]">A clear, legally binding boundary between telemetry signals and private IP.</p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#36C98F]/20 bg-[#36C98F]/[0.02] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#36C98F]">
                <CheckCircle2 className="size-4" /> What Sprintly Senses & Computes
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-[#b5b5b5]">
                <li className="flex items-start gap-2">
                  <span className="text-[#36C98F]">✓</span> Focus time duration (active minutes vs idle gaps)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#36C98F]">✓</span> Terminal command categories (build, test, git, lint, packageManager)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#36C98F]">✓</span> Edit counts & rough line delta estimates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#36C98F]">✓</span> AI prompt frequencies and assistance ratios
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#36C98F]">✓</span> Test suite execution success/failure recovery transitions
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#F06464]/20 bg-[#F06464]/[0.02] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F06464]">
                <ShieldAlert className="size-4" /> What Sprintly Strictly Refuses to Touch
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-[#b5b5b5]">
                <li className="flex items-start gap-2">
                  <span className="text-[#F06464]">✕</span> Raw source code, function names, and variable definitions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F06464]">✕</span> Terminal output text, logs, and stack traces
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F06464]">✕</span> Keystroke logs, clipboard content, or webcam telemetry
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F06464]">✕</span> Git diff payloads, commit messages, and commit hashes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F06464]">✕</span> .env variables, API credentials, and SSH keys
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   3. HUMAN VS AI BALANCE: The Modern Engineering Reality
   ========================================================================= */

export function HumanAiSynergySection() {
  return (
    <section className="border-b border-white/[.07] bg-[#09090b] px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <motion.div {...reveal}>
          <StatusPill tone="amber">
            <Bot className="size-3.5" /> AI Dissection & Authenticity
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Measure the synergy between human craft and AI leverage.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#989898]">
            Software development is no longer purely manual typing. Sprintly distinguishes thoughtful AI orchestration (Claude Code, Cursor, Copilot) from unexamined prompt spamming.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[.05] text-[#9B8CFF]">
                <Cpu className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f4f4f4]">Prompt Frequency vs Line Output</h4>
                <p className="mt-1 text-xs leading-5 text-[#888888]">
                  Detects whether AI-generated suggestions are carefully refined or blindly committed, rewarding deep verification cycles.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[.05] text-[#32C7D9]">
                <Activity className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f4f4f4]">Token Volume Estimation</h4>
                <p className="mt-1 text-xs leading-5 text-[#888888]">
                  Computes anonymous token ranges across Claude, Codex, and Copilot to quantify cognitive delegation without parsing prompt strings.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[.05] text-[#36C98F]">
                <Award className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f4f4f4]">The AI Balance Score</h4>
                <p className="mt-1 text-xs leading-5 text-[#888888]">
                  Ensures developers retain mastery of foundational logic while maximizing the velocity of modern toolchains.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Comparison Card */}
        <motion.div {...reveal} className="panel p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/[.07] pb-4">
            <span className="mono text-xs text-[#888888]">SESSION METRIC DISSECTION</span>
            <span className="mono rounded bg-[#32C7D9]/10 px-2.5 py-1 text-xs text-[#32C7D9]">BALANCED COGNITION</span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">Manual Coding Craft</span>
                <span className="mono font-semibold text-[#f4f4f4]">68% (Architecture & TDD)</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[.08]">
                <div className="h-full w-[68%] rounded-full bg-[#f4f4f4]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">AI Assisted Synthesis</span>
                <span className="mono font-semibold text-[#9B8CFF]">24% (Boilerplate & Test Gen)</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[.08]">
                <div className="h-full w-[24%] rounded-full bg-[#7C6CF2]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">Automated Tooling & Linters</span>
                <span className="mono font-semibold text-[#32C7D9]">8% (Formatters & Codegen)</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[.08]">
                <div className="h-full w-[8%] rounded-full bg-[#32C7D9]" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/[.07] bg-[#0c0c0e] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Calculated AI Balance Rating</span>
              <span className="mono font-bold text-[#36C98F]">84 / 100 (Optimal)</span>
            </div>
            <p className="mt-2 text-[11px] text-[#666666]">
              "High architecture autonomy paired with disciplined prompt verification. Zero evidence of unverified copy-paste regressions."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   4. DEVELOPER IDENTITY & ACHIEVEMENTS: The Strava for Coders
   ========================================================================= */

export function DeveloperIdentitySection() {
  const archetypes = [
    {
      name: "Terminal Architect",
      desc: "Lives in shell scripts, multi-stage builds, and disciplined test-runner loops. Rarely touches a GUI.",
      metric: "72% CLI Commands",
      badge: "CLI Native",
    },
    {
      name: "Flow State Artisan",
      desc: "Sustains 90m+ single-context sessions with zero task switching. Deep, unbroken focus curve.",
      metric: "94 Focus Score",
      badge: "Deep Work",
    },
    {
      name: "Resilient Builder",
      desc: "High failure recovery velocity. Turns broken test suites and compiler errors green in minutes.",
      metric: "98% Recovery Rate",
      badge: "Zero Regression",
    },
    {
      name: "Full-Stack Sprinter",
      desc: "High choreography across frontend, API routes, database schemas, and migration scripts.",
      metric: "18+ Files/Session",
      badge: "Full Orbit",
    },
  ];

  const badges = [
    { name: "Clean Exit", desc: "Completed session with zero unresolved test errors", icon: CheckCircle2 },
    { name: "Iron Cadence", desc: "14 consecutive days of verified 60m+ deep sessions", icon: Flame },
    { name: "Midnight Flow", desc: "3 uninterrupted hours between 11pm and 4am", icon: Clock },
    { name: "TDD Vanguard", desc: "Executed test suite prior to every single commit", icon: ShieldCheck },
  ];

  return (
    <section className="border-b border-white/[.07] bg-[#070709] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <motion.div {...reveal} className="text-center max-w-3xl mx-auto">
          <StatusPill tone="green">
            <Trophy className="size-3.5" /> Progression & Archetypes
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            A real developer identity. Not vanity badges.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#959595]">
            Unlike generic gamification apps that award stars for clicking buttons, Sprintly derives authentic archetypes and achievements from your verified engineering telemetry.
          </p>
        </motion.div>

        {/* Archetypes Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {archetypes.map((arch, i) => (
            <motion.div
              key={arch.name}
              {...reveal}
              transition={{ delay: i * 0.08 }}
              className="panel flex flex-col justify-between p-6 transition hover:border-[#7C6CF2]/40"
            >
              <div>
                <span className="mono rounded bg-[#7C6CF2]/15 px-2.5 py-1 text-[11px] font-semibold text-[#9B8CFF]">
                  {arch.badge}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[#f4f4f4]">{arch.name}</h3>
                <p className="mt-2.5 text-xs leading-5 text-[#888888]">{arch.desc}</p>
              </div>
              <div className="mt-6 border-t border-white/[.06] pt-4">
                <span className="mono text-xs font-semibold text-[#36C98F]">{arch.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Milestone Badges Showcase */}
        <div className="mt-14 panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.07] pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#f4f4f4]">Verifiable Milestone Badges</h3>
              <p className="mt-1 text-xs text-[#888888]">Earned through mathematical telemetry signatures, not vanity claims.</p>
            </div>
            <Link href="/app" className="inline-flex items-center gap-2 text-xs font-semibold text-[#9B8CFF] hover:underline">
              View all 24 achievements <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map(({ name, desc, icon: Icon }) => (
              <div key={name} className="flex items-start gap-3.5 rounded-xl border border-white/[.05] bg-white/[.02] p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#7C6CF2]/15 text-[#9B8CFF]">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#f4f4f4]">{name}</h4>
                  <p className="mt-1 text-[11px] leading-4 text-[#777777]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   5. SPRINTLY FOR TEAMS: Healthy Visibility Without Surveillance
   ========================================================================= */

export function TeamsAndEnterpriseSection() {
  return (
    <section className="border-b border-white/[.07] bg-[#09090b] px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div {...reveal} className="panel p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/[.07] pb-4">
            <div>
              <span className="mono text-xs text-[#888888]">CORE TEAM PULSE</span>
              <h4 className="text-base font-semibold text-[#f4f4f4]">Sprint 42 Momentum</h4>
            </div>
            <StatusPill tone="green">Opt-In Pool</StatusPill>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
              <span className="mono text-[10px] text-[#777777]">TEAM FOCUS TIME</span>
              <p className="mono mt-1 text-2xl font-bold text-[#f4f4f4]">142.5 hrs</p>
              <p className="mt-1 text-xs text-[#36C98F]">7 out of 8 contributing</p>
            </div>
            <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
              <span className="mono text-[10px] text-[#777777]">MEETING DEBT REDUCTION</span>
              <p className="mono mt-1 text-2xl font-bold text-[#f4f4f4]">-22%</p>
              <p className="mt-1 text-xs text-[#32C7D9]">Protected mornings</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[.07] bg-[#0c0c0e] p-4">
            <div className="flex justify-between text-xs">
              <span className="text-[#999999]">Sprint Velocity Health</span>
              <span className="mono font-semibold text-[#f4f4f4]">86% Green</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[.08]">
              <div className="h-full w-[86%] rounded-full bg-[#36C98F]" />
            </div>
            <p className="mt-3 text-[11px] text-[#777777]">
              Zero individual leaderboard ranking. Team views measure sustainable collective momentum, not micromanaged individual outputs.
            </p>
          </div>
        </motion.div>

        <motion.div {...reveal}>
          <StatusPill tone="violet">
            <Users className="size-3.5" /> Engineering Leadership
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Empower the team without spying on the engineers.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#989898]">
            Traditional enterprise analytics tools try to track lines of code, open tabs, and camera feeds. Engineers hate them. Sprintly creates a trust-first culture where developers voluntarily contribute aggregate momentum.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: "No Manager Surveillance",
                desc: "Managers see aggregate focus blocks and sprint health—never keystrokes, individual rankings, or private session names.",
              },
              {
                title: "Cognitive Thrash Detection",
                desc: "Identify sprints plagued by excessive context switching or fragmented schedules before developer burnout happens.",
              },
              {
                title: "Objective Retrospectives",
                desc: "Back up sprint retros with empirical focus data instead of subjective guesswork.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <ShieldCheck className="size-5 shrink-0 text-[#36C98F] mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#f4f4f4]">{item.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#888888]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/for-teams"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#f2f2f2] px-5 text-xs font-semibold text-[#09090b] transition hover:bg-white"
            >
              Explore Sprintly for Teams <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   6. INTERACTIVE ROI & FOCUS CALCULATOR
   ========================================================================= */

export function FocusCalculatorSection() {
  const [dailyHours, setDailyHours] = useState(5);
  const [switches, setSwitches] = useState(8);

  // Math: Each context switch loses ~18 minutes of focus time
  const lostMinutesPerDay = switches * 18;
  const lostHoursPerWeek = ((lostMinutesPerDay * 5) / 60).toFixed(1);
  const reclaimedHours = (parseFloat(lostHoursPerWeek) * 0.45).toFixed(1);
  const potentialDevScore = Math.min(950, Math.round(620 + dailyHours * 30 + (20 - switches) * 8));

  return (
    <section className="border-b border-white/[.07] bg-[#070709] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <motion.div {...reveal} className="text-center max-w-2xl mx-auto">
          <StatusPill tone="cyan">
            <Gauge className="size-3.5" /> Flow Optimization
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Calculate your focus yield.
          </h2>
          <p className="mt-4 text-base text-[#959595]">
            See how much deep-work potential is lost to context switching and how Sprintly’s boundary enforcement helps you reclaim it.
          </p>
        </motion.div>

        <motion.div {...reveal} className="mt-12 panel grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#f4f4f4]">Daily Coding Window</span>
                <span className="mono font-semibold text-[#9B8CFF]">{dailyHours} hours / day</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="mt-3 w-full accent-[#7C6CF2]"
              />
              <div className="flex justify-between text-[10px] text-[#666666]">
                <span>2 hrs (Part-time)</span>
                <span>6 hrs (Standard)</span>
                <span>12 hrs (Deep sprint)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#f4f4f4]">Daily Interruptions & Context Switches</span>
                <span className="mono font-semibold text-[#F6A94A]">{switches} switches / day</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={switches}
                onChange={(e) => setSwitches(Number(e.target.value))}
                className="mt-3 w-full accent-[#F6A94A]"
              />
              <div className="flex justify-between text-[10px] text-[#666666]">
                <span>1 (Isolated flow)</span>
                <span>8 (Typical team)</span>
                <span>20 (Meeting heavy)</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-4 text-xs text-[#888888]">
              Cognitive studies indicate developers lose an average of 18-23 minutes to resume deep focus after an external interruption.
            </div>
          </div>

          {/* Results Display */}
          <div className="flex flex-col justify-between rounded-xl border border-[#7C6CF2]/30 bg-[#7C6CF2]/[0.05] p-6 sm:p-8">
            <div>
              <span className="mono text-xs uppercase tracking-wider text-[#9B8CFF]">
                PROJECTED FOCUS RECOVERY
              </span>
              <div className="mt-4">
                <p className="mono text-4xl font-bold text-[#f4f4f4] sm:text-5xl">+{reclaimedHours} hrs</p>
                <p className="mt-1 text-xs text-[#36C98F]">Reclaimed deep work per sprint week</p>
              </div>

              <div className="mt-6 border-t border-white/[.08] pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#999999]">Projected DevScore Target</span>
                  <span className="mono font-bold text-[#f4f4f4]">{potentialDevScore} / 1000</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C6CF2] to-[#36C98F]"
                    style={{ width: `${(potentialDevScore / 1000) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/app"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f2f2f2] px-5 text-xs font-semibold text-[#09090b] transition hover:bg-white"
              >
                Start Reclaiming Deep Work <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   7. DETAILED DEVELOPER FAQ
   ========================================================================= */

export function DeveloperFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Sprintly ever send my source code or prompt text to your servers?",
      a: "Never. Sprintly's VS Code companion extension operates under strict zero-AST principles. It extracts only numerical counts: file touches, rough line velocity deltas, command exit codes, and prompt frequency counts. The text of your code, variables, commit messages, and prompt strings never leave your machine.",
    },
    {
      q: "Can I use Sprintly completely offline without an account?",
      a: "Yes. Local-first is a complete product tier in Sprintly. You can install the extension, track your sessions, view local rhythm heatmaps, compute your DevScore, and export/import canonical session JSON files without ever signing up or pinging our cloud API.",
    },
    {
      q: "How does the DevScore (0 - 1000) algorithm work and can it be gamed?",
      a: "DevScore is computed server-side using multiple cross-verified signals: Testing Discipline (test runs per code modification), Error Recovery Velocity (time from failing test/build to green suite), Focus Depth (continuous unfragmented session duration), Consistency Cadence (multi-day rhythm), and AI Balance. Artificial script typing or vanity line-spamming is automatically penalized because it lacks realistic terminal exit loops and testing patterns.",
    },
    {
      q: "How does the VS Code companion extension connect to the web app?",
      a: "You initiate a pairing request from the Sprintly settings screen, which opens `vscode://tu-tu-op.sprintly/connect`. A short-lived one-time code is exchanged for an authenticated device token, which is stored in your OS keychain. The database only stores a salted SHA-256 hash.",
    },
    {
      q: "How does Sprintly compare to WakaTime or GitHub contribution graphs?",
      a: "GitHub contribution graphs only track git commits, incentivizing squashing or fake empty commits. WakaTime records open window time without distinguishing active deep work from idle editor tabs. Sprintly is session-based: you deliberately start and end a session, and it measures cognitive discipline, failure recovery, and real engineering flow.",
    },
    {
      q: "Can my engineering manager use Sprintly to micromanage me?",
      a: "No. Sprintly for Teams is architecturally designed around consent. Team views show collective sprint velocity, meeting load reduction, and team focus blocks. Managers cannot see individual rankings, keystroke logs, or private session tags.",
    },
  ];

  return (
    <section className="border-b border-white/[.07] bg-[#09090b] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[980px]">
        <motion.div {...reveal} className="text-center">
          <StatusPill tone="gray">
            <LockKeyhole className="size-3.5" /> Technical FAQ
          </StatusPill>
          <h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Frequently answered engineering questions.
          </h2>
          <p className="mt-4 text-base text-[#929292]">
            Detailed answers on privacy boundaries, local persistence, scoring logic, and architecture.
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              {...reveal}
              transition={{ delay: i * 0.05 }}
              className="panel overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-[#f4f4f4] hover:text-[#9B8CFF]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-[#888888] transition-transform duration-200 ${
                    openIndex === i ? "rotate-180 text-[#9B8CFF]" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-white/[.06] bg-black/20 p-5 pt-3 text-xs leading-6 text-[#9e9e9e]">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   8. HIGH-IMPACT FINAL CTA & SPECIFICATIONS
   ========================================================================= */

export function FinalCtaSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <motion.div
        {...reveal}
        className="panel mx-auto max-w-[1240px] overflow-hidden rounded-[24px] border border-[#7C6CF2]/30 bg-gradient-to-b from-[#141419] via-[#0d0f14] to-[#08080a] p-8 sm:p-14"
      >
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <StatusPill tone="amber">
                <Flame className="size-3.5" /> Start Your Streak Today
              </StatusPill>
              <span className="mono text-xs text-[#888888]">NO CREDIT CARD NEEDED</span>
            </div>
            <h2 className="text-balance mt-6 text-3xl font-semibold tracking-[-.05em] text-[#f4f4f4] sm:text-5xl">
              Turn your coding sessions into proof of progress.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#9e9e9e]">
              Install the companion extension or explore the live dashboard in demo mode right now. Your first session stays 100% on your machine.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f2f2f2] px-6 text-sm font-semibold text-[#09090b] transition hover:bg-white"
              >
                <Play className="size-4 fill-current" /> Open Sprintly Web
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-6 text-sm font-medium text-[#d0d0d0] transition hover:bg-white/[.08]"
              >
                Follow Data Path <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Quick Terminal Command Card */}
          <div className="rounded-xl border border-white/[.08] bg-[#050507] p-5">
            <div className="flex items-center justify-between border-b border-white/[.06] pb-3 text-xs">
              <span className="mono text-[#888888]">QUICK SETUP COMPANION</span>
              <span className="mono text-[10px] text-[#36C98F]">VS CODE MARKETPLACE</span>
            </div>
            <div className="mono mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded bg-white/[.03] p-2.5 text-[#a8a8a8]">
                <span>ext install tu-tu-op.sprintly</span>
                <span className="text-[10px] text-[#666666]">CLI</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[.03] p-2.5 text-[#a8a8a8]">
                <span>demo@sprintly.local</span>
                <span className="text-[10px] text-[#9B8CFF]">DEMO USER</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#777777]">
              <ShieldCheck className="size-3.5 text-[#36C98F]" />
              <span>Includes demo credentials with 40+ mock sessions</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* =========================================================================
   GLOBAL MARKETING FOOTER
   ========================================================================= */

export function RedesignedFooter() {
  return (
    <footer className="border-t border-white/[.07] bg-[#050507] py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#f4f4f4]">
              <span className="grid size-7 place-items-center rounded-lg bg-[#7C6CF2] text-white">
                <Flame className="size-4" />
              </span>
              Sprintly
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#787878]">
              The developer productivity operating system. Private by default, useful every day, and built to turn focused coding into lasting progress.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#36C98F] shadow-[0_0_10px_#36C98F]" />
              <span className="mono text-xs text-[#888888]">All Systems Operational · v1.0.4</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-xs">
            <div>
              <p className="mono uppercase tracking-[.18em] text-[#666666]">Product</p>
              <div className="mt-4 grid gap-3 text-[#9a9a9a]">
                <Link href="/product" className="hover:text-white transition">Features</Link>
                <Link href="/how-it-works" className="hover:text-white transition">How it works</Link>
                <Link href="/for-teams" className="hover:text-white transition">For Teams</Link>
                <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              </div>
            </div>

            <div>
              <p className="mono uppercase tracking-[.18em] text-[#666666]">Security</p>
              <div className="mt-4 grid gap-3 text-[#9a9a9a]">
                <Link href="/privacy" className="hover:text-white transition">Privacy Perimeter</Link>
                <span className="text-[#555555]">Zero-AST Sensing</span>
                <span className="text-[#555555]">RFC 3339 Model</span>
                <span className="text-[#555555]">Local-First Tier</span>
              </div>
            </div>

            <div>
              <p className="mono uppercase tracking-[.18em] text-[#666666]">Live App</p>
              <div className="mt-4 grid gap-3 text-[#9a9a9a]">
                <Link href="/app" className="hover:text-white transition">Dashboard</Link>
                <Link href="/app/sessions" className="hover:text-white transition">Sessions</Link>
                <Link href="/app/analytics" className="hover:text-white transition">Analytics</Link>
                <Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
              </div>
            </div>

            <div>
              <p className="mono uppercase tracking-[.18em] text-[#666666]">Account</p>
              <div className="mt-4 grid gap-3 text-[#9a9a9a]">
                <Link href="/sign-in" className="hover:text-white transition">Sign In</Link>
                <Link href="/create-account" className="hover:text-white transition">Create Account</Link>
                <Link href="/onboarding" className="hover:text-white transition">Onboarding</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[.06] pt-8 text-xs text-[#555555] sm:flex-row">
          <p>© 2026 Sprintly Technologies. Built for focused developers.</p>
          <div className="flex gap-6 text-[#777777]">
            <Link href="/privacy" className="hover:text-[#a0a0a0]">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-[#a0a0a0]">Terms of Service</Link>
            <span className="mono">Contract: devstrava.session.v1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
