"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LockKeyhole, ShieldCheck, Trophy, X } from "lucide-react";
import { toast } from "sonner";

import { useSprintly } from "@/components/sprintly-provider";
import { buildLeaderboardPacket, type LeaderboardEntry } from "@/lib/sprintly/analytics";

type Scope = "global" | "country" | "region";
type ApiEntry = { rank: number; user_id: string; display_name: string; handle: string; score: number; focus_time_seconds: number; session_count: number; consistency_score: number };

const panelMotion = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28 } };

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <motion.section {...panelMotion} className={`panel ${className}`}>{children}</motion.section>; }
function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#f2f2f2]">Community - consent first</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b8b8b]">{description}</p></div>{action}</div>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[11px] text-[#bdbdbd]">{children}</span>; }
function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

export function CommunityPage() {
  const { sessions, preferences, profile, userId, repositoryMode, updatePreferences } = useSprintly();
  const records = useMemo(() => sessions.map((session) => session.record), [sessions]);
  const initialScope: Scope = preferences.leaderboardScope === "country" || preferences.leaderboardScope === "region" ? preferences.leaderboardScope : "global";
  const [scope, setScope] = useState<Scope>(initialScope);
  const [remoteEntries, setRemoteEntries] = useState<ApiEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);

  const scopeKey = scope === "global" ? "global" : scope === "country" ? profile.country : profile.region;
  useEffect(() => {
    if (repositoryMode !== "remote") { setRemoteEntries([]); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/leaderboard?scope=${scope}&scopeKey=${encodeURIComponent(scopeKey)}`, { cache: "no-store" })
      .then(async (response) => { const body = await response.json() as { entries?: ApiEntry[]; error?: string }; if (!response.ok) throw new Error(body.error || "Unable to load leaderboard"); return body; })
      .then((body) => { if (!cancelled) setRemoteEntries(body.entries ?? []); })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load leaderboard"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [repositoryMode, scope, scopeKey]);

  const packet = buildLeaderboardPacket(records, scope === "global" ? "GLOBAL" : profile.region, new Date(), preferences.timeZone);
  const localEntry = preferences.leaderboardOptIn ? [{ id: userId, name: profile.displayName, handle: `@${profile.handle}`, avatar: initials(profile.displayName), country: profile.country, city: profile.city, friends: [], ...packet, region: profile.region }] : [];
  const entries = repositoryMode === "remote"
    ? remoteEntries.map((entry) => ({ id: entry.user_id, name: entry.display_name, handle: `@${entry.handle.replace(/^@/, "")}`, avatar: initials(entry.display_name), country: "", city: "", friends: [], schemaVersion: 1 as const, devScoreVersion: "v1" as const, week: "current", region: scopeKey, sessions: entry.session_count, activeMinutes: Math.round(entry.focus_time_seconds / 60), focusScore: Math.round(entry.focus_time_seconds / 60), recoveryScore: 0, devScore: Math.round(entry.score), streak: 0 }))
    : localEntry;

  const join = () => { updatePreferences({ leaderboardOptIn: true, leaderboardScope: scope, geographicLeaderboardOptIn: scope !== "global" }); setJoinOpen(false); toast.success("Leaderboard participation enabled", { description: "Only aggregate data is eligible for this scope." }); };
  const leave = () => { updatePreferences({ leaderboardOptIn: false }); toast.success("Leaderboard participation disabled"); };

  return <div><PageHeader title="Leaderboard, your way." description="Synced does not mean public. Rankings contain aggregate scores only, and global, country, and region visibility are separately consented." action={preferences.leaderboardOptIn ? <Pill><ShieldCheck className="size-3" /> Opted in - {scope}</Pill> : <button onClick={() => setJoinOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b]"><Trophy className="size-4" /> Join a leaderboard</button>} />{!preferences.leaderboardOptIn && <Panel className="mb-3 border-[#9a9a9a]/20 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-xl bg-[#9a9a9a]/10"><LockKeyhole className="size-5" /></div><div className="flex-1"><p className="text-sm font-medium">You are not ranked yet</p><p className="mt-1 text-xs leading-5 text-[#929292]">Joining is explicit. Raw code, prompts, file names, terminal output, and complete history stay private.</p></div><button onClick={() => setJoinOpen(true)} className="min-h-10 rounded-lg border border-[#9a9a9a]/25 px-3 text-xs">Review shared fields</button></div></Panel>}<div className="mb-3 flex gap-2 overflow-x-auto">{(["global", "country", "region"] as Scope[]).map((item) => <button key={item} onClick={() => setScope(item)} className={`min-h-10 shrink-0 rounded-lg px-4 text-xs capitalize ${scope === item ? "bg-white/[.08] text-white" : "text-[#828282] hover:bg-white/[.04]"}`}>{item}</button>)}</div><div className="grid gap-3 xl:grid-cols-[1.35fr_.65fr]"><Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/[.07] p-4"><div><h2 className="text-sm font-semibold">{scope} rankings</h2><p className="mt-1 text-[10px] text-[#7a7a7a]">Server-ranked aggregate entries - score v1</p></div><Pill>{loading ? "Refreshing" : repositoryMode === "remote" ? "Supabase" : "Local-only"}</Pill></div><div className="grid grid-cols-[45px_1fr_80px_80px] gap-3 border-b border-white/[.06] px-4 py-3 text-[10px] uppercase tracking-[.12em] text-[#686868] sm:grid-cols-[60px_1fr_100px_100px]"><span>Rank</span><span>Developer</span><span>Score</span><span>Focus</span></div>{entries.map((entry, index) => <div key={entry.id} className={`grid min-h-[70px] grid-cols-[45px_1fr_80px_80px] items-center gap-3 border-b border-white/[.06] px-4 py-3 last:border-0 sm:grid-cols-[60px_1fr_100px_100px] ${entry.id === userId ? "bg-[#f2f2f2]/[.08]" : ""}`}><div className="mono text-sm font-semibold">#{index + 1}</div><div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#252525] text-[10px] font-semibold">{entry.avatar}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{entry.name}{entry.id === userId ? " - you" : ""}</p><p className="truncate text-[10px] text-[#767676]">{entry.handle}</p></div></div><span className="mono text-xs">{entry.devScore}</span><span className="mono text-xs text-[#8b8b8b]">{entry.focusScore}</span></div>)}{!entries.length && <div className="p-8 text-center text-xs text-[#7d7d7d]">{error || "No opted-in entries for this scope yet."}</div>}</Panel><div className="space-y-3"><Panel className="p-5"><p className="mono text-[10px] uppercase tracking-[.15em] text-[#7d7d7d]">Your aggregate packet</p><div className="mt-5 grid grid-cols-2 gap-3">{[["Sessions", packet.sessions], ["Minutes", packet.activeMinutes], ["Focus", packet.focusScore], ["Recovery", packet.recoveryScore], ["Score", packet.devScore]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-white/[.025] p-3"><p className="mono text-lg font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{String(label)}</p></div>)}</div><p className="mt-4 text-[11px] leading-5 text-[#7d7d7d]">Only this aggregate packet can enter ranking tables. It does not publish raw sessions.</p></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Leave leaderboard</h2><p className="mt-2 text-xs leading-5 text-[#858585]">Leaving stops future submissions and revokes existing aggregate entries.</p>{preferences.leaderboardOptIn && <button onClick={leave} className="mt-5 min-h-10 rounded-lg border border-[#b7b7b7]/25 px-3 text-xs">Leave leaderboard</button>}</Panel></div></div>{joinOpen && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-2xl"><div className="flex items-start justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#9a9a9a]">Explicit consent</p><h2 className="mt-2 text-xl font-semibold">Join the {scope} leaderboard?</h2></div><button onClick={() => setJoinOpen(false)} aria-label="Close consent dialog" className="grid size-10 place-items-center rounded-lg text-[#7a7a7a]"><X className="size-4" /></button></div><p className="mt-4 text-sm leading-6 text-[#a8a8a8]">Sprintly will share aggregate weekly score, focus time, session count, and consistency. Your raw session payload is never returned in public leaderboard responses.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setJoinOpen(false)} className="min-h-11 rounded-lg border border-white/[.09] px-4 text-sm">Cancel</button><button onClick={join} className="min-h-11 rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b]">Join leaderboard</button></div></div></div>}</div>;
}
