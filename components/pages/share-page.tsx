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

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

const defaultShareFields: ShareField[] = ["codingTime", "archetype", "codingMix", "recovery", "failures"];

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function ShareCard({ title, payload, fields }: { title: string; payload: Partial<ReturnType<typeof buildSharePayload>>; fields: ShareField[] }) {
  const has = (field: ShareField) => fields.includes(field);
  return <div className="relative overflow-hidden rounded-[24px] border border-[#737373]/40 bg-[radial-gradient(circle_at_85%_8%,rgba(157,157,157,.22),transparent_36%),linear-gradient(145deg,#181818,#101217_65%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:p-8"><div className="absolute -right-12 -top-12 size-44 rounded-full bg-[#f2f2f2]/10 blur-2xl"/><div className="relative"><div className="flex items-center justify-between"><p className="mono text-[10px] font-semibold tracking-[.2em] text-[#d0d0d0]">SPRINTLY</p><span className="mono text-[10px] text-[#6e6e6e]">#Sprintly</span></div><p className="mono mt-10 text-[10px] uppercase tracking-[.18em] text-[#c7c7c7]">{title}</p>{has("archetype") && <h2 className="mt-3 text-3xl font-semibold tracking-[-.06em] sm:text-4xl">{payload.archetype || "New Builder"}</h2>}{has("codingTime") && <p className="mono mt-7 text-5xl font-semibold tracking-[-.08em] sm:text-6xl">{payload.codingTime || "0m"}</p>}{has("codingMix") && payload.codingMix && <div className="mt-7 grid grid-cols-3 gap-2"><div><p className="mono text-xl font-semibold">{payload.codingMix.manual}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Manual</p></div><div><p className="mono text-xl font-semibold text-[#c7c7c7]">{payload.codingMix.aiAssisted}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">AI-assisted</p></div><div><p className="mono text-xl font-semibold text-[#e0e0e0]">{payload.codingMix.automation}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Automation</p></div></div>}<div className="mt-8 grid grid-cols-2 gap-2">{has("recovery") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.recovery ?? 0}%</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Recovery</p></div>}{has("failures") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.failures ?? 0}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Failures</p></div>}{has("tokenUsage") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{number(payload.tokenUsage ?? 0)}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Tokens</p></div>}{has("terminalActivity") && <div className="rounded-xl border border-white/[.08] bg-white/[.04] p-3"><p className="mono text-xl font-semibold">{payload.terminalActivity ?? 0}</p><p className="mt-1 text-[10px] text-[#7d7d7d]">Terminal events</p></div>}</div>{(has("streak") || has("devScore")) && <p className="mt-7 text-xs text-[#a1a1a1]">{[has("streak") ? `${payload.streak ?? 0}-day streak` : null, has("devScore") ? `Dev Score ${payload.devScore ?? 0} · v1` : null].filter(Boolean).join(" · ")}</p>}</div></div>;
}

function shareText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function buildSvgCard(title: string, payload: Partial<ReturnType<typeof buildSharePayload>>, fields: ShareField[]) {
  const has = (field: ShareField) => fields.includes(field);
  const lines: string[] = ["SPRINTLY", title];
  if (has("archetype")) lines.push(payload.archetype || "New Builder");
  if (has("codingTime")) lines.push(payload.codingTime || "0m");
  if (has("codingMix") && payload.codingMix) lines.push(`Manual ${payload.codingMix.manual}% · AI ${payload.codingMix.aiAssisted}% · Auto ${payload.codingMix.automation}%`);
  if (has("recovery")) lines.push(`Recovery ${payload.recovery ?? 0}%`);
  if (has("failures")) lines.push(`Failures ${payload.failures ?? 0}`);
  if (has("tokenUsage")) lines.push(`Tokens ${number(payload.tokenUsage ?? 0)}`);
  if (has("terminalActivity")) lines.push(`Terminal events ${payload.terminalActivity ?? 0}`);
  if (has("devScore")) lines.push(`Dev Score ${payload.devScore ?? 0} · v1`);
  if (has("streak")) lines.push(`${payload.streak ?? 0}-day streak`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#181818"/><stop offset="1" stop-color="#121212"/></linearGradient><radialGradient id="glow"><stop stop-color="#bdbdbd" stop-opacity=".35"/><stop offset="1" stop-color="#bdbdbd" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" rx="32" fill="url(#bg)"/><circle cx="1040" cy="30" r="260" fill="url(#glow)"/><g fill="#f2f2f2" font-family="Arial, sans-serif">${lines.map((line, index) => `<text x="80" y="${90 + index * (index === 0 ? 0 : 64)}" font-size="${index === 0 ? 22 : index === 2 ? 54 : 28}" font-weight="${index <= 2 ? 700 : 500}" fill="${index === 1 ? "#c7c7c7" : "#f2f2f2"}">${shareText(line)}</text>`).join("")}<text x="80" y="570" font-size="18" fill="#7d7d7d">#Sprintly · explicit stats only</text></g></svg>`;
}

export function SharePage() {
  const search = useSearchParams();
  const { sessions, profile, preferences, userId, createShare } = useSprintly();
  const records = recordsOf(sessions);
  const kind = (search.get("kind") as "session" | "weekly" | "achievement" | "profile" | null) || "weekly";
  const sessionId = search.get("sessionId");
  const session = records.find((record) => record.sessionId === sessionId);
  // A session share requires a valid session; without one there is no
  // honest source to snapshot. (Returned after all hooks below.)
  const aggregate = aggregateSessions(kind === "session" && session ? [session] : filterSessionsByRange(records, "week", new Date(), undefined, preferences.timeZone));
  const streaks = getStreakStats(records, new Date(), preferences.timeZone);
  const payload = buildSharePayload(session, aggregate, streaks.current);
  const [fields, setFields] = useState<ShareField[]>(defaultShareFields);
  const [created, setCreated] = useState("");
  if (kind === "session" && !session) {
    return <Panel className="p-8"><div className="text-center"><Upload className="mx-auto size-8 text-[#f2f2f2]"/><p className="mt-4 text-sm font-medium">Session not found</p><p className="mt-2 text-xs text-[#7d7d7d]">{sessionId ? `No session with ID "${sessionId}" exists in your imported history.` : "Choose a session from your history to create its share card."}</p><Link href="/app/sessions" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-3 text-xs font-semibold">Back to history <ChevronRight className="size-3.5"/></Link></div></Panel>;
  }
  const title = kind === "session" ? "SESSION SNAPSHOT" : kind === "achievement" ? "ACHIEVEMENT UNLOCKED" : kind === "profile" ? "DEVELOPER PROFILE" : "WEEKLY RECAP";
  const toggle = (field: ShareField) => setFields((current) => current.includes(field) ? current.filter((item) => item !== field) : [...current, field]);
  // Preview, stored snapshot, and SVG export are all built from this
  // exact minimized payload so they can never disagree.
  const selectedPayload = Object.fromEntries(fields.map((field) => [field, payload[field]])) as Partial<ReturnType<typeof buildSharePayload>>;
  const generate = () => {
    const id = `share_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const snapshot: ShareSnapshot = { id, ownerId: userId, createdAt: new Date().toISOString(), kind: kind === "profile" || kind === "achievement" || kind === "session" ? kind : "weekly", title, selectedFields: fields, payload: selectedPayload };
    createShare(snapshot);
    setCreated(`${window.location.origin}/share/${id}`);
    toast.success("Share snapshot created", { description: "Only the fields you selected are included." });
  };
  const copy = async () => { if (!created) return; await navigator.clipboard?.writeText(created); toast.success("Snapshot link copied"); };
  const exportSvg = () => downloadTextFile(`sprintly-${kind}-card.svg`, buildSvgCard(title, selectedPayload, fields), "image/svg+xml");
  return <div><PageHeader eyebrow="Social layer · user controlled" title="Create a share card" description="Choose exactly which aggregate fields appear. Generate is always explicit; nothing publishes automatically." action={<Link href="/app" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[.08] px-4 text-sm text-[#cacaca]">Back to dashboard</Link>}/><div className="grid gap-3 xl:grid-cols-[.85fr_1.15fr]"><Panel className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#f2f2f2]/10 text-[#d2d2d2]"><Sparkles className="size-5"/></div><div><h2 className="text-sm font-semibold">Customize {kind}</h2><p className="mt-1 text-xs text-[#7d7d7d]">{profile.displayName} · safe summary fields</p></div></div><div className="mt-6 space-y-2">{(Object.keys(SHARE_FIELD_LABELS) as ShareField[]).map((field) => <label key={field} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-white/[.07] bg-white/[.02] px-3 hover:bg-white/[.04]"><input type="checkbox" checked={fields.includes(field)} onChange={() => toggle(field)} className="size-4 accent-[#f2f2f2]"/><span className="text-xs">{SHARE_FIELD_LABELS[field]}</span><span className="ml-auto text-[10px] text-[#686868]">{field === "tokenUsage" || field === "terminalActivity" ? "optional" : "safe default"}</span></label>)}</div><div className="mt-6 rounded-xl border border-[#d0d0d0]/15 bg-[#d0d0d0]/[.04] p-4"><p className="text-sm font-medium text-[#c1c1c1]">Privacy guardrail</p><p className="mt-2 text-xs leading-5 text-[#858585]">Raw prompts, source code, file names, terminal output, and secrets are never part of the share model.</p></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><button onClick={generate} disabled={!fields.length} className="min-h-11 flex-1 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-4 text-sm font-semibold disabled:opacity-40">Generate snapshot</button><button onClick={exportSvg} disabled={!fields.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/[.09] px-4 text-xs font-semibold text-[#cacaca] disabled:opacity-40"><Download className="size-4"/> Export SVG</button></div>{created && <div className="mt-5 rounded-xl border border-[#f2f2f2]/25 bg-[#f2f2f2]/[.06] p-4"><p className="text-xs font-medium">Snapshot URL</p><p className="mt-2 break-all font-mono text-[11px] text-[#d0d0d0]">{created}</p><div className="mt-3 flex gap-2"><button onClick={copy} className="min-h-9 rounded-lg bg-[#f2f2f2] text-[#0b0b0b] px-3 text-xs font-semibold">Copy link</button><Link href={created.replace(window.location.origin, "")} className="inline-flex min-h-9 items-center rounded-lg border border-white/[.09] px-3 text-xs text-[#cacaca]">Open snapshot</Link></div><p className="mt-3 text-[10px] leading-5 text-[#7d7d7d]">This development build stores snapshots in the browser’s local demo store. A production API will make these URLs portable across devices.</p></div>}</Panel><div><ShareCard title={title} payload={selectedPayload} fields={fields}/><Panel className="mt-3 p-5"><div className="flex items-center gap-3"><FileUp className="size-4 text-[#bdbdbd]"/><div><p className="text-sm font-medium">Made for sharing</p><p className="mt-1 text-xs leading-5 text-[#7d7d7d]">The SVG export is a social-friendly vector card. Share a session without exposing your full history.</p></div></div></Panel></div></div></div>;
}
