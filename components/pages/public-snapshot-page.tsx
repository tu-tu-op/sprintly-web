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

function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "cyan" | "gray" }) {
  const colors = { violet: "border-[#f2f2f2]/25 bg-[#f2f2f2]/10 text-[#d0d0d0]", green: "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]", amber: "border-[#9a9a9a]/25 bg-[#9a9a9a]/[.08] text-[#c2c2c2]", cyan: "border-[#bdbdbd]/25 bg-[#bdbdbd]/[.08] text-[#c7c7c7]", gray: "border-white/10 bg-white/[.035] text-[#9c9c9c]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${colors[tone]}`}>{children}</span>;
}

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function ShareCard({ title, payload, fields }: { title: string; payload: Partial<ReturnType<typeof buildSharePayload>>; fields: ShareField[] }) {
  const has = (field: ShareField) => fields.includes(field);
  return <div className="relative overflow-hidden rounded-[24px] border border-[#737373]/40 bg-[radial-gradient(circle_at_85%_8%,rgba(157,157,157,.22),transparent_36%),linear-gradient(145deg,#181818,#101217_65%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:p-8"><div className="absolute -right-12 -top-12 size-44 rounded-full bg-[#f2f2f2]/10 blur-2xl"/><div className="relative"><div className="flex items-center justify-between"><p className="mono text-[10px] font-semibold tracking-[.2em] text-[#d0d0d0]">SPRINTLY</p><span className="mono text-[10px] text-[#6e6e6e]">#Sprintly</span></div><p className="mono mt-10 text-[10px] uppercase tracking-[.18em] text-[#c7c7c7]">{title}</p>{has("archetype") && <h2 className="mt-3 text-3xl font-semibold tracking-[-.06em] sm:text-4xl">{payload.archetype || "New Builder"}</h2>}{has("codingTime") && <p className="mono mt-7 text-5xl font-semibold tracking-[-.08em] sm:text-6xl">{payload.codingTime || "0m"}</p>}{has("codingMix") && payload.codingMix && <div className="mt-7 grid grid-cols-3 gap-2"><div><p className="mono text-xl font-semibold">{payload.codingMix.manual}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Manual</p></div><div><p className="mono text-xl font-semibold text-[#c7c7c7]">{payload.codingMix.aiAssisted}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">AI-assisted</p></div><div><p className="mono text-xl font-semibold text-[#e0e0e0]">{payload.codingMix.automation}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Automation</p></div></div>}<div className="mt-8 grid grid-cols-2 gap-2">{has("recovery") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.recovery ?? 0}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Recovery</p></div>}{has("failures") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.failures ?? 0}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Failures</p></div>}{has("tokenUsage") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{number(payload.tokenUsage ?? 0)}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Tokens</p></div>}{has("terminalActivity") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.terminalActivity ?? 0}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Terminal events</p></div>}</div>{(has("streak") || has("devScore")) && <p className="mt-7 text-xs text-[#a1a1a1]">{[has("streak") ? `${payload.streak ?? 0}-day streak` : null, has("devScore") ? `Dev Score ${payload.devScore ?? 0} · v1` : null].filter(Boolean).join(" · ")}</p>}</div></div>;
}

export function PublicSnapshotPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [snapshot, setSnapshot] = useState<ShareSnapshot | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => { if (id) { const found = loadUserData(DEMO_USER.id).shares.find((share) => share.id === id) ?? null; setSnapshot(found); setChecked(true); } }, [id]);
  if (!checked) return <main className="grid min-h-dvh place-items-center bg-[#090909] text-sm text-[#8b8b8b]">Opening snapshot…</main>;
  if (!snapshot) return <main className="grid min-h-dvh place-items-center bg-[#090909] p-6 text-center"><div><p className="mono text-xs uppercase tracking-[.18em] text-[#f2f2f2]">Sprintly snapshot</p><h1 className="mt-4 text-2xl font-semibold">This snapshot is unavailable.</h1><p className="mt-2 text-sm text-[#7d7d7d]">It may have been deleted or created in another browser in this local demo.</p><Link href="/sign-in" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold">Open Sprintly</Link></div></main>;
  return <main className="noise min-h-dvh bg-[#090909] px-4 py-8 sm:px-8"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between"><Link href="/" className="text-sm font-semibold">sprintly</Link><Pill tone="gray"><Eye className="size-3"/> Public snapshot</Pill></div><div className="mt-10"><ShareCard title={snapshot.title} payload={snapshot.payload} fields={snapshot.selectedFields}/></div><p className="mt-5 text-center text-xs text-[#7d7d7d]">Only explicitly selected statistics are shown. This is not a complete developer profile.</p></div></main>;
}
