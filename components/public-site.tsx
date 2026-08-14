"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Award, BarChart3, Check, ChevronRight, CircleDot, Cloud, Code2,
  EyeOff, FileCode2, Flame, Globe2, HardDrive, LockKeyhole, MousePointer2,
  Play, ShieldCheck, TerminalSquare, Trophy, UserRoundCheck,
} from "lucide-react";
import { PublicNav } from "./public-nav";
import { Brand } from "./brand";
import { HeroScrollDemo } from "./hero-scroll-demo";

const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-70px" }, transition: { duration: .45 } };
const week = [38, 68, 46, 82, 74, 92, 61];

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "violet" | "amber" | "gray" }) {
  const colors = { green: "border-[#36c98f]/25 bg-[#36c98f]/8 text-[#7de4ba]", violet: "border-[#7c6cf2]/30 bg-[#7c6cf2]/10 text-[#b8afff]", amber: "border-[#f6a94a]/25 bg-[#f6a94a]/8 text-[#f5c579]", gray: "border-white/10 bg-white/[.035] text-[#a6acb7]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colors[tone]}`}>{children}</span>;
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[1040px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0b0d10] shadow-[0_48px_120px_rgba(0,0,0,.55)]">
      <div className="flex h-11 items-center gap-2 border-b border-white/[.07] px-4">
        <span className="size-2.5 rounded-full bg-[#f06464]/70" /><span className="size-2.5 rounded-full bg-[#f6a94a]/70" /><span className="size-2.5 rounded-full bg-[#36c98f]/70" />
        <span className="mono ml-3 text-[10px] text-[#656c78]">sprintly / overview</span>
      </div>
      <div className="grid min-h-[470px] grid-cols-1 md:grid-cols-[180px_1fr]">
        <aside className="hidden border-r border-white/[.07] bg-[#090b0d] p-4 md:block">
          <Brand />
          <div className="mt-7 space-y-1.5">
            {["Overview", "Workspace", "Sessions", "Analytics", "Goals"].map((item, i) => <div key={item} className={`rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-white/[.07] text-white" : "text-[#727986]"}`}>{item}</div>)}
          </div>
          <div className="mt-28 rounded-xl border border-[#36c98f]/15 bg-[#36c98f]/[.05] p-3">
            <div className="flex items-center gap-2 text-[10px] text-[#7de4ba]"><span className="size-1.5 rounded-full bg-[#36c98f]" /> Up to date</div>
            <p className="mt-2 text-[10px] leading-relaxed text-[#767d88]">Selected data synced</p>
          </div>
        </aside>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#7c6cf2]">Tuesday · Momentum rising</p><h3 className="mt-2 text-xl font-semibold tracking-[-.03em]">Keep the streak alive, Maya.</h3></div>
            <div className="flex items-center gap-2 rounded-xl border border-[#f6a94a]/20 bg-[#f6a94a]/[.06] px-3 py-2"><Flame className="size-4 text-[#f6a94a]" /><span className="mono text-sm font-semibold">12 days</span></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[["Focus time", "18h 24m", "+14%"], ["Sessions", "14", "+3"], ["Tasks done", "23", "+8"], ["Focus score", "87", "Best"]].map(([l,v,d]) => <div key={l} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-[10px] text-[#7d8490]">{l}</p><p className="mono mt-2 text-lg font-semibold">{v}</p><p className="mt-1 text-[9px] text-[#69d7aa]">{d} this week</p></div>)}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl border border-white/[.07] bg-[#0e1115] p-4">
              <div className="flex items-center justify-between"><span className="text-xs font-medium">Weekly intensity</span><span className="mono text-[9px] text-[#6f7682]">18H 24M</span></div>
              <div className="mt-5 flex h-32 items-end gap-2" role="img" aria-label="Weekly coding activity, strongest on Saturday">
                {week.map((h, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="relative flex h-24 w-full items-end overflow-hidden rounded-md bg-white/[.035]"><motion.div initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: .55, delay: i * .05 }} className={`w-full rounded-md ${i === 5 ? "bg-gradient-to-t from-[#7c6cf2] to-[#32c7d9]" : "bg-[#7c6cf2]/35"}`} /></div><span className="mono text-[8px] text-[#686f7a]">{["M","T","W","T","F","S","S"][i]}</span></div>)}
              </div>
            </div>
            <div className="rounded-xl border border-white/[.07] bg-[#0e1115] p-4">
              <div className="flex items-center justify-between"><span className="text-xs font-medium">Active sprint</span><span className="mono text-[9px] text-[#7de4ba]">68%</span></div>
              <div className="mt-5 flex items-center gap-4"><div className="grid size-20 place-items-center rounded-full" style={{ background: "conic-gradient(#7c6cf2 0 68%, #20242b 68% 100%)" }}><div className="grid size-16 place-items-center rounded-full bg-[#0e1115]"><span className="mono text-sm">7/10</span></div></div><div><p className="text-xs font-medium">Ship activity view</p><p className="mt-1 text-[10px] text-[#747b87]">3 tasks left · 2 days</p></div></div>
              <div className="mt-5 border-t border-white/[.06] pt-3"><p className="text-[10px] text-[#737a85]">Next milestone</p><p className="mt-1 text-xs">Precision Coder · Level 4</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return <footer className="border-t border-white/[.07] py-10"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center"><Brand /><p className="text-sm text-[#737984]">Private by default. Useful every day. © 2026 Sprintly.</p><div className="flex gap-5 text-sm text-[#8e949f]"><Link href="/privacy">Privacy</Link><Link href="/pricing">Pricing</Link><Link href="/sign-in">Sign in</Link></div></div></footer>;
}

export function HomePage() {
  return (
    <div className="noise min-h-dvh">
      <PublicNav />
      <main>
        <section className="relative overflow-hidden border-b border-white/[.07] bg-[#090b0e]">
          <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#7c6cf2]/[.08] blur-[110px]" />
          <HeroScrollDemo
            titleComponent={
              <motion.div {...reveal} className="mx-auto max-w-[920px] px-3 text-center">
            <h1 className="text-balance text-[clamp(2.8rem,7vw,6.25rem)] font-semibold leading-[.94] tracking-[-.065em]">Make your coding<br /><span className="bg-gradient-to-r from-[#f4f2ed] via-[#9b8cff] to-[#32c7d9] bg-clip-text text-transparent">progress visible.</span></h1>
            <p className="text-pretty mx-auto mt-7 max-w-2xl text-base leading-7 text-[#9aa1ad] sm:text-lg">Sprintly turns focused coding sessions into a private record of consistency, momentum, and the developer you’re becoming.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/app" className="custom-cursor-element inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c6cf2] px-5 text-sm font-semibold text-white transition hover:bg-[#8b7cf7] sm:w-auto"><Play aria-hidden="true" className="size-4 fill-current" /> Explore live product</Link>
              <Link href="/how-it-works" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-5 text-sm font-medium text-[#d4d6dc] transition hover:bg-white/[.07] sm:w-auto">See how tracking works <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3"><StatusPill><HardDrive className="size-3.5" /> Local-first</StatusPill><StatusPill tone="violet"><EyeOff className="size-3.5" /> No source code collected</StatusPill><StatusPill tone="gray"><Cloud className="size-3.5" /> Sync is optional</StatusPill></div>
              </motion.div>
            }
          />
        </section>

        <section className="border-y border-white/[.07] bg-[#0a0c0f] px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <motion.div {...reveal}><p className="mono text-xs uppercase tracking-[.2em] text-[#32c7d9]">Local loop</p><h2 className="text-balance mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Track the work.<br />Keep the code.</h2><p className="mt-5 max-w-lg leading-7 text-[#9299a6]">You start every session. Sprintly records aggregate activity on your machine. Raw code, terminal content, and file contents never enter the model.</p><Link href="/privacy" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-[#b8afff]">Explore privacy controls <ChevronRight className="size-4" /></Link></motion.div>
            <motion.div {...reveal} className="panel p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 border-b border-white/[.07] pb-5"><StatusPill>Recording locally</StatusPill><span className="mono text-xs text-[#6f7682]">00:48:12</span><span className="ml-auto text-xs text-[#777e89]">api-redesign</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">{[[FileCode2,"14","files touched"],[Code2,"386","edits"],[TerminalSquare,"22","terminal events"]].map(([Icon,n,l]) => { const C = Icon as typeof FileCode2; return <div key={String(l)} className="rounded-xl border border-white/[.07] bg-white/[.02] p-4"><C className="size-4 text-[#747b87]"/><p className="mono mt-5 text-2xl font-semibold">{String(n)}</p><p className="mt-1 text-xs text-[#7d8490]">{String(l)}</p></div>})}</div>
              <div className="mt-3 rounded-xl border border-[#36c98f]/15 bg-[#36c98f]/[.04] p-4"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-[#36c98f]"/><div><p className="text-sm font-medium">Stored on this device</p><p className="mt-1 text-xs text-[#7e8691]">Nothing syncs until you connect and choose categories.</p></div></div></div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-[1180px]">
            <motion.div {...reveal} className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mono text-xs uppercase tracking-[.2em] text-[#7c6cf2]">One developer system</p><h2 className="text-balance mt-4 max-w-2xl text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Proof of progress, without performative productivity.</h2></div><p className="max-w-sm text-sm leading-6 text-[#8c939f]">The useful parts of a fitness tracker, rebuilt for deep work and developer identity.</p></motion.div>
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {[{icon:BarChart3,k:"01",t:"Read your rhythm",d:"See when focus peaks, which projects absorb your time, and how consistency changes."},{icon:Trophy,k:"02",t:"Build an identity",d:"Earn understated archetypes and achievements from real patterns, not vanity clicks."},{icon:Globe2,k:"03",t:"Compete by choice",d:"Share only eligible, synchronized metrics. Local activity is never silently public."}].map(({icon:Icon,k,t,d},i)=><motion.div {...reveal} transition={{delay:i*.06}} key={t} className="panel group min-h-[260px] p-6 transition-colors hover:border-white/20"><div className="flex items-center justify-between"><Icon className="size-5 text-[#a99fff]"/><span className="mono text-xs text-[#555c67]">{k}</span></div><h3 className="mt-20 text-xl font-semibold tracking-[-.025em]">{t}</h3><p className="mt-3 text-sm leading-6 text-[#888f9a]">{d}</p></motion.div>)}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6"><motion.div {...reveal} className="mx-auto max-w-[1180px] overflow-hidden rounded-[20px] border border-[#7c6cf2]/25 bg-[#111019] p-8 sm:p-12"><div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end"><div><StatusPill tone="amber"><Flame className="size-3.5"/> Ready when you are</StatusPill><h2 className="text-balance mt-6 max-w-3xl text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Your next great streak starts with one honest session.</h2></div><Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f4f2ed] px-5 text-sm font-semibold text-[#0b0c0e]">Open Sprintly <ArrowRight className="size-4"/></Link></div></motion.div></section>
      </main><Footer />
    </div>
  );
}

const flowSteps = [
  { icon: Code2, title: "Install the extension", detail: "A lightweight VS Code companion. No account required." },
  { icon: Play, title: "Start a session", detail: "Tracking begins only when you explicitly press start." },
  { icon: HardDrive, title: "Record locally", detail: "Aggregate activity stays in local Sprintly storage." },
  { icon: BarChart3, title: "Review progress", detail: "Understand focus, consistency, projects, and momentum." },
  { icon: UserRoundCheck, title: "Connect optionally", detail: "Authenticate only when you want account features." },
  { icon: Cloud, title: "Choose what syncs", detail: "Select activity categories and a date range." },
  { icon: Trophy, title: "Share by choice", detail: "Only eligible data counts toward community rankings." },
];

export function HowItWorksPage() {
  const [active, setActive] = useState(0);
  return <div className="noise min-h-dvh"><PublicNav/><main className="px-4 py-16 sm:px-6 sm:py-24"><div className="mx-auto max-w-[1180px]"><p className="mono text-xs uppercase tracking-[.2em] text-[#32c7d9]">The data path</p><h1 className="text-balance mt-4 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">From a focused session to a record you control.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#969da8]">Sprintly’s local-first loop is useful before you create an account—and transparent after you do.</p>
    <div className="mt-14 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className="space-y-2">{flowSteps.map(({icon:Icon,title,detail},i)=><button key={title} onClick={()=>setActive(i)} aria-pressed={active===i} className={`flex min-h-[76px] w-full items-center gap-4 rounded-xl border p-4 text-left transition ${active===i?"border-[#7c6cf2]/45 bg-[#7c6cf2]/10":"border-white/[.07] bg-white/[.02] hover:bg-white/[.04]"}`}><span className={`mono grid size-9 shrink-0 place-items-center rounded-lg text-xs ${active===i?"bg-[#7c6cf2] text-white":"bg-white/[.05] text-[#777e8a]"}`}>{String(i+1).padStart(2,"0")}</span><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-[#848b96]">{detail}</p></div><Icon aria-hidden="true" className="ml-auto size-4 shrink-0 text-[#777e89]"/></button>)}</div>
      <div className="panel relative min-h-[500px] overflow-hidden p-6 sm:p-10"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,108,242,.16),transparent_45%)]"/><div className="relative flex h-full min-h-[420px] flex-col items-center justify-center text-center"><motion.div key={active} initial={{opacity:0,scale:.92,y:14}} animate={{opacity:1,scale:1,y:0}} className="grid size-24 place-items-center rounded-[28px] border border-[#7c6cf2]/35 bg-[#7c6cf2]/10 shadow-[0_0_60px_rgba(124,108,242,.18)]">{(() => {const Icon=flowSteps[active].icon;return <Icon className="size-9 text-[#b8afff]"/>})()}</motion.div><p className="mono mt-8 text-xs text-[#7c6cf2]">STEP {active+1} OF 7</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.035em]">{flowSteps[active].title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#8d949f]">{flowSteps[active].detail}</p><div className="mt-9 flex flex-wrap justify-center gap-2"><StatusPill>Private by default</StatusPill>{active>=4&&<StatusPill tone="violet">Explicit consent</StatusPill>}{active===6&&<StatusPill tone="amber">Leaderboard eligible</StatusPill>}</div></div></div>
    </div></div></main><Footer/></div>;
}

export function PrivacyPage() {
  const rules=[{icon:MousePointer2,t:"You start tracking",d:"Sprintly never assumes every open editor window is work. Recording starts only after a deliberate action."},{icon:EyeOff,t:"Your code stays yours",d:"Sprintly measures aggregate activity. It does not collect source code, terminal content, secrets, or keystrokes."},{icon:HardDrive,t:"Local is a complete mode",d:"Use sessions, streaks, and local review without creating an account or enabling network access."},{icon:Cloud,t:"Sync has a boundary",d:"The extension sends selected categories through an authenticated API. The website cannot inspect arbitrary VS Code storage."},{icon:Globe2,t:"Public is a second choice",d:"Synced does not mean public. Leaderboards and profile sharing have their own explicit controls."}];
  return <div className="noise min-h-dvh"><PublicNav/><main><section className="px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-[980px] text-center"><StatusPill><LockKeyhole className="size-3.5"/> Privacy is product architecture</StatusPill><h1 className="text-balance mt-7 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Private by default is a behavior, not a promise.</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#969da8]">Every Sprintly state tells you where your activity lives, what is synchronized, and what can be shared.</p></div></section><section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-[980px] border-t border-white/[.08]">{rules.map(({icon:Icon,t,d},i)=><motion.div {...reveal} key={t} className="grid gap-5 border-b border-white/[.08] py-8 sm:grid-cols-[72px_1fr_1.2fr] sm:items-start"><span className="mono text-sm text-[#5f6672]">0{i+1}</span><div className="flex items-center gap-3"><Icon className="size-5 text-[#8f82fa]"/><h2 className="text-lg font-semibold">{t}</h2></div><p className="text-sm leading-6 text-[#8d949f]">{d}</p></motion.div>)}</div></section><section className="px-4 pb-24 sm:px-6"><div className="mx-auto grid max-w-[980px] gap-3 md:grid-cols-3">{[["Local data","On your device","gray"],["Synced","In your Sprintly account","violet"],["Leaderboard eligible","Explicitly shared","amber"]].map(([t,d,tone])=><div key={t} className="panel p-5"><StatusPill tone={tone as "gray"|"violet"|"amber"}>{t}</StatusPill><p className="mt-8 text-sm text-[#9299a6]">{d}</p></div>)}</div></section></main><Footer/></div>;
}

const plans=[{name:"Free",price:"$0",note:"For building the habit",features:["Unlimited local sessions","7-day web history","Core streaks & achievements","Manual import and export"],cta:"Start locally"},{name:"Premium",price:"$8",note:"For understanding your craft",features:["Full synchronized history","Advanced analytics","Goals and sprint planning","Shareable session summaries","Optional Sprintly Insights"],cta:"Try Premium",featured:true},{name:"Teams",price:"Soon",note:"For focused engineering groups",features:["Private team challenges","Shared sprint progress","Team privacy controls","No individual surveillance"],cta:"Join waitlist"}];
export function PricingPage(){return <div className="noise min-h-dvh"><PublicNav/><main className="px-4 py-16 sm:px-6 sm:py-24"><div className="mx-auto max-w-[1120px]"><div className="max-w-3xl"><p className="mono text-xs uppercase tracking-[.2em] text-[#7c6cf2]">Simple plans</p><h1 className="text-balance mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Start local. Upgrade when history becomes insight.</h1><p className="mt-6 text-lg text-[#9299a6]">Core tracking never depends on a subscription or an AI model.</p></div><div className="mt-14 grid gap-3 lg:grid-cols-3">{plans.map((p)=><div key={p.name} className={`panel relative flex min-h-[490px] flex-col p-6 ${p.featured?"border-[#7c6cf2]/50 shadow-[0_24px_80px_rgba(124,108,242,.12)]":""}`}>{p.featured&&<span className="absolute right-5 top-5 rounded-full bg-[#7c6cf2] px-2.5 py-1 text-xs font-semibold">Best momentum</span>}<p className="mono text-xs uppercase tracking-[.16em] text-[#858c98]">{p.name}</p><p className="mono mt-8 text-4xl font-semibold tracking-[-.05em]">{p.price}{p.price.startsWith("$")&&<span className="text-sm font-normal text-[#737a86]"> / month</span>}</p><p className="mt-3 text-sm text-[#8b929e]">{p.note}</p><div className="my-7 h-px bg-white/[.08]"/><ul className="space-y-4">{p.features.map(f=><li key={f} className="flex gap-3 text-sm text-[#b3b7c0]"><Check className="size-4 shrink-0 text-[#36c98f]"/>{f}</li>)}</ul><Link href="/app" className={`mt-auto inline-flex min-h-12 items-center justify-center rounded-xl text-sm font-semibold ${p.featured?"bg-[#7c6cf2] text-white":"border border-white/10 bg-white/[.04] text-[#d4d7dd]"}`}>{p.cta}</Link></div>)}</div><div className="mt-8 flex items-start gap-3 rounded-xl border border-[#36c98f]/15 bg-[#36c98f]/[.04] p-4 text-sm text-[#9ea5af]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#36c98f]"/><p>Subscription status never changes what the extension records locally. Synchronization categories remain under your control on every plan.</p></div></div></main><Footer/></div>}
