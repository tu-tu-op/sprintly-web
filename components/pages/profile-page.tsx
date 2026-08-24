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

function number(value: number) { return new Intl.NumberFormat("en-IN").format(Math.round(value)); }

function Progress({ value, color = "#f2f2f2" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function recordsOf(sessions: ReturnType<typeof useSprintly>["sessions"]): SprintlySession[] { return sessions.map((session) => session.record); }

function avatarStyle(archetype: string, traits: string[]) {
  const seed = `${archetype}:${traits.join(":")}`;
  const palettes = ["from-[#f2f2f2] to-[#bdbdbd]", "from-[#9a9a9a] to-[#b7b7b7]", "from-[#d0d0d0] to-[#bdbdbd]", "from-[#d2d2d2] to-[#9a9a9a]"];
  return palettes[seed.length % palettes.length];
}

const PROFILE_HANDLE_PATTERN = /^[a-z0-9_]{3,24}$/;

function EditProfileForm({ onCancel }: { onCancel: () => void }) {
  const { profile, updateProfile } = useSprintly();
  const [form, setForm] = useState(profile);
  const [error, setError] = useState("");
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));
  const save = () => {
    if (!form.displayName.trim()) { setError("Display name cannot be empty."); return; }
    if (!PROFILE_HANDLE_PATTERN.test(form.handle.trim())) { setError("Handle must be 3-24 lowercase letters, numbers, or underscores."); return; }
    updateProfile({ ...form, displayName: form.displayName.trim(), handle: form.handle.trim(), bio: form.bio.trim() });
    toast.success("Profile updated", { description: "Your developer identity is stored with your local record." });
    onCancel();
  };
  const field = "mt-2 h-11 w-full rounded-xl border border-white/[.09] bg-white/[.025] px-3 text-sm outline-none focus:border-[#f2f2f2]";
  return <Panel className="mt-3 p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Edit developer identity</h2><Pill tone="gray">Stored locally</Pill></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label htmlFor="profile-name" className="text-xs font-medium text-[#bdbdbd]">Display name</label><input id="profile-name" value={form.displayName} onChange={(event) => set({ displayName: event.target.value })} className={field}/></div><div><label htmlFor="profile-handle" className="text-xs font-medium text-[#bdbdbd]">Handle</label><input id="profile-handle" value={form.handle} onChange={(event) => set({ handle: event.target.value.toLowerCase() })} className={field}/></div><div><label htmlFor="profile-city" className="text-xs font-medium text-[#bdbdbd]">City</label><input id="profile-city" value={form.city} onChange={(event) => set({ city: event.target.value })} className={field}/></div><div><label htmlFor="profile-region" className="text-xs font-medium text-[#bdbdbd]">Region</label><input id="profile-region" value={form.region} onChange={(event) => set({ region: event.target.value })} className={field}/></div><div><label htmlFor="profile-country" className="text-xs font-medium text-[#bdbdbd]">Country code</label><input id="profile-country" value={form.country} onChange={(event) => set({ country: event.target.value.slice(0, 2).toUpperCase() })} maxLength={2} className={field}/></div><div className="sm:col-span-2"><label htmlFor="profile-bio" className="text-xs font-medium text-[#bdbdbd]">Bio</label><textarea id="profile-bio" value={form.bio} rows={2} maxLength={200} onChange={(event) => set({ bio: event.target.value })} className={`${field} h-auto py-2.5 leading-6`}/></div></div>{error && <p role="alert" className="mt-4 rounded-lg border border-[#b7b7b7]/20 bg-[#b7b7b7]/[.06] p-3 text-xs leading-5 text-[#bdbdbd]">{error}</p>}<div className="mt-5 flex gap-2"><button onClick={save} className="min-h-10 rounded-lg bg-[#f2f2f2] px-4 text-xs font-semibold text-[#0b0b0b]">Save changes</button><button onClick={onCancel} className="min-h-10 rounded-lg border border-white/[.09] px-4 text-xs text-[#bdbdbd]">Cancel</button></div></Panel>;
}

export function ProfilePage() {
  const { sessions, profile, preferences, updatePreferences } = useSprintly();
  const [editing, setEditing] = useState(false);
  const records = recordsOf(sessions);
  const aggregate = aggregateSessions(records);
  const streaks = getStreakStats(records, new Date(), preferences.timeZone);
  const achievements = computeAchievements(records, streaks, preferences.timeZone);
  const personal = computePersonalRecords(records, streaks, preferences.timeZone);
  const avatar = avatarStyle(aggregate.archetype, aggregate.traits);
  return <div><PageHeader eyebrow="Developer identity" title={profile.displayName} description={preferences.profileVisibility === "public" ? "Your selected summary is public. Raw sessions and unselected statistics remain private." : "Your profile is private. Turn on public visibility only when you are ready to share the selected summary."} action={<div className="flex flex-wrap gap-2"><button onClick={() => setEditing((value) => !value)} aria-expanded={editing} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${editing ? "border border-white/[.09] text-[#bdbdbd]" : "bg-[#f2f2f2] text-[#0b0b0b]"}`}>{editing ? <X className="size-4"/> : <UserRound className="size-4"/>} {editing ? "Close editor" : "Edit profile"}</button><Link href="/app/share?kind=profile" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[.08] px-4 text-sm text-[#cacaca]"><Upload className="size-4"/> Customize profile card</Link></div>}/><Panel className="relative overflow-hidden p-6 sm:p-8"><div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(128,128,128,.18),transparent_55%)]"/><div className="relative flex flex-col gap-7 sm:flex-row sm:items-center"><div className={`grid size-24 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br ${avatar} text-2xl font-semibold shadow-[0_16px_45px_rgba(128,128,128,.2)]`}>{initials(profile.displayName)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-[-.04em]">@{profile.handle}</h2><Pill tone={preferences.profileVisibility === "public" ? "green" : "gray"}>{preferences.profileVisibility === "public" ? <><Globe2 className="size-3"/> Public</> : <><LockKeyhole className="size-3"/> Private</>}</Pill></div><p className="mt-2 text-sm text-[#929292]">{profile.city} · {profile.region} · {profile.bio}</p><div className="mt-5 flex flex-wrap gap-6">{[[`${streaks.current} days`, "streak"], [formatDuration(aggregate.activeDurationSeconds), "coding time"], [number(records.length), "sessions"], [number(achievements.filter((item) => item.unlocked).length), "achievements"]].map(([value, label]) => <div key={String(label)}><p className="mono text-lg font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#7a7a7a]">{String(label)}</p></div>)}</div></div><div className="rounded-xl border border-[#f2f2f2]/25 bg-[#f2f2f2]/[.08] p-4 sm:min-w-[230px]"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#f2f2f2]/15"><Sparkles className="size-5 text-[#c2c2c2]"/></div><div><p className="text-sm font-semibold">{aggregate.archetype}</p><p className="text-[10px] text-[#8e8e8e]">Derived deterministically from your record</p></div></div><div className="mt-4"><Progress value={Math.min(100, aggregate.scores.devScore / 10)} /></div><p className="mt-3 text-[10px] text-[#7d7d7d]">Dev Score {buildLeaderboardPacket(records, profile.country).devScore} · version v1</p></div></div></Panel>{editing && <EditProfileForm onCancel={() => setEditing(false)}/>}<div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_.65fr]"><Panel className="p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Achievements</h2><p className="mt-1 text-xs text-[#7a7a7a]">Unlocked from actual sessions</p></div><Link href="/app/achievements" className="text-xs text-[#c2c2c2]">View all</Link></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">{achievements.slice(0, 6).map((achievement) => <div key={achievement.id} className={`rounded-xl border p-4 ${achievement.unlocked ? "border-[#9a9a9a]/20 bg-[#9a9a9a]/[.04]" : "border-white/[.07] bg-white/[.02] opacity-55"}`}><div className="grid size-9 place-items-center rounded-full bg-white/[.05] text-[#9a9a9a]"><Medal className="size-4"/></div><p className="mt-4 text-xs font-medium">{achievement.title}</p><p className="mt-1 text-[10px] text-[#787878]">{achievement.unlocked ? "Unlocked" : `${achievement.progress}% complete`}</p></div>)}</div></Panel><Panel className="p-5"><h2 className="text-sm font-semibold">Personal records</h2><div className="mt-5 space-y-5">{[[Trophy, "Longest session", formatDuration(personal.longestSessionSeconds)], [Flame, "Longest streak", `${personal.longestStreak} days`], [HeartPulse, "Best recovery", `${personal.bestRecovery}%`], [Rocket, "Best weekly score", `${personal.bestWeeklyDevScore}`]].map(([Icon, label, value]) => { const C = Icon as typeof Trophy; return <div key={String(label)} className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-white/[.04]"><C className="size-4 text-[#f2f2f2]"/></div><div><p className="text-xs text-[#838383]">{String(label)}</p><p className="mono mt-1 text-sm font-semibold">{String(value)}</p></div></div>; })}</div></Panel></div><Panel className="mt-3 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-xl bg-[#f2f2f2]/10 text-[#d2d2d2]"><Eye className="size-5"/></div><div className="flex-1"><h2 className="text-sm font-semibold">Profile visibility</h2><p className="mt-1 text-xs leading-5 text-[#858585]">Public profiles show your name, archetype, coding mix, selected scores, streak, and achievements. They never expose raw history.</p></div><div className="flex items-center gap-2"><button onClick={() => updatePreferences({ profileVisibility: "private" })} className={`min-h-10 rounded-lg px-3 text-xs ${preferences.profileVisibility === "private" ? "border border-white/[.1] text-white" : "text-[#7d7d7d]"}`}>Private</button><button onClick={() => updatePreferences({ profileVisibility: "public" })} className={`min-h-10 rounded-lg px-3 text-xs ${preferences.profileVisibility === "public" ? "bg-[#d0d0d0] text-[#0b0b0b] text-[#0e0e0e]" : "border border-white/[.1] text-[#bdbdbd]"}`}>Public</button></div></div><p className="mt-4 text-[11px] text-[#757575]">Change this setting here or in Privacy Center. Only explicitly selected summary fields are exposed.</p></Panel></div>;
}
