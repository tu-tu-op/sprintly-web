"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Check, ChevronRight, Cloud, Code2, Gauge,
  EyeOff, FileCode2, Flame, Globe2, HardDrive, LockKeyhole, MousePointer2,
  Play, ShieldCheck, TerminalSquare, Trophy, UserRoundCheck, Users,
} from "lucide-react";
import { PublicNav } from "./public-nav";
import { Brand } from "./brand";
import {
  InteractiveStudioSection,
  ArchitecturePipelineSection,
  HumanAiSynergySection,
  DeveloperIdentitySection,
  TeamsAndEnterpriseSection,
  FocusCalculatorSection,
  DeveloperFaqSection,
  FinalCtaSection,
  RedesignedFooter,
  StatusPill,
} from "./landing-sections";

const HeroScrollDemo = dynamic(
  () => import("./hero-scroll-demo").then(({ HeroScrollDemo }) => HeroScrollDemo),
  {
    ssr: true,
    loading: () => <div aria-hidden="true" className="min-h-[56rem] md:min-h-[72rem]" />,
  },
);

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.45 },
};

export function HomePage() {
  return (
    <div className="noise min-h-dvh">
      {/* Preserved Navigation Bar */}
      <PublicNav />

      <main>
        {/* Preserved Hero Section */}
        <section className="relative overflow-hidden border-b border-white/[.07] bg-[#0b0b0b]">
          <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#f2f2f2]/[.08] blur-[110px]" />
          <HeroScrollDemo
            titleComponent={
              <motion.div {...reveal} initial={false} className="mx-auto max-w-[920px] px-3 text-center">
                <h1 className="text-balance text-[clamp(2.8rem,7vw,6.25rem)] font-semibold leading-[.94] tracking-[-.065em]">
                  Make your coding<br />
                  <span className="bg-gradient-to-r from-[#f4f2ed] via-[#9b8cff] to-[#32c7d9] bg-clip-text text-transparent">
                    progress visible.
                  </span>
                </h1>
              </motion.div>
            }
            afterComponent={
              <motion.div {...reveal} className="relative z-10 mx-auto -mt-16 max-w-[920px] px-4 pb-24 text-center sm:-mt-20">
                <p className="text-pretty mx-auto max-w-2xl text-base leading-7 text-[#a0a0a0] sm:text-lg">
                  Sprintly turns focused coding sessions into a private record of consistency, momentum, and the developer you’re becoming.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/app"
                    className="custom-cursor-element inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2f2f2] px-5 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#ededed] sm:w-auto"
                  >
                    <Play aria-hidden="true" className="size-4 fill-current" /> Explore live product
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-5 text-sm font-medium text-[#d6d6d6] transition hover:bg-white/[.07] sm:w-auto"
                  >
                    See how tracking works <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <StatusPill tone="green"><HardDrive className="size-3.5" /> Local-first</StatusPill>
                  <StatusPill tone="violet"><EyeOff className="size-3.5" /> No source code collected</StatusPill>
                  <StatusPill tone="gray"><Cloud className="size-3.5" /> Sync is optional</StatusPill>
                </div>
              </motion.div>
            }
          />
        </section>

        {/* 1. Interactive Telemetry Studio (Live SaaS Interactive Demo) */}
        <InteractiveStudioSection />

        {/* 2. Cryptographic Sensor Pipeline & Boundary Matrix */}
        <ArchitecturePipelineSection />

        {/* 3. Human Craft vs AI Synergy Dissection */}
        <HumanAiSynergySection />

        {/* 4. Developer Progression & Verifiable Archetypes */}
        <DeveloperIdentitySection />

        {/* 5. Sprintly for Teams: Healthy Visibility Without Surveillance */}
        <TeamsAndEnterpriseSection />

        {/* 6. Interactive Focus Yield Calculator */}
        <FocusCalculatorSection />

        {/* 7. Extensive Engineering FAQ */}
        <DeveloperFaqSection />

        {/* 8. Conversion Call to Action */}
        <FinalCtaSection />
      </main>

      {/* Redesigned Engineering Footer */}
      <RedesignedFooter />
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
  return (
    <div className="noise min-h-dvh">
      <PublicNav />
      <main className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="mono text-xs uppercase tracking-[.2em] text-[#bdbdbd]">The data path</p>
          <h1 className="text-balance mt-4 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">
            From a focused session to a record you control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#9c9c9c]">
            Sprintly’s local-first loop is useful before you create an account—and transparent after you do.
          </p>

          <div className="mt-14 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <div className="space-y-2">
              {flowSteps.map(({ icon: Icon, title, detail }, i) => (
                <button
                  key={title}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`flex min-h-[76px] w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    active === i
                      ? "border-[#f2f2f2]/45 bg-[#f2f2f2]/10"
                      : "border-white/[.07] bg-white/[.02] hover:bg-white/[.04]"
                  }`}
                >
                  <span
                    className={`mono grid size-9 shrink-0 place-items-center rounded-lg text-xs ${
                      active === i ? "bg-[#f2f2f2] text-[#0b0b0b]" : "bg-white/[.05] text-[#7d7d7d]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#f4f4f4]">{title}</p>
                    <p className="mt-1 text-xs text-[#8a8a8a]">{detail}</p>
                  </div>
                  <Icon aria-hidden="true" className="ml-auto size-4 shrink-0 text-[#7d7d7d]" />
                </button>
              ))}
            </div>

            <div className="panel relative min-h-[500px] overflow-hidden p-6 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(128,128,128,.16),transparent_45%)]" />
              <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.92, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="grid size-24 place-items-center rounded-[28px] border border-[#f2f2f2]/35 bg-[#f2f2f2]/10 shadow-[0_0_60px_rgba(128,128,128,.18)]"
                >
                  {(() => {
                    const Icon = flowSteps[active].icon;
                    return <Icon className="size-9 text-[#d0d0d0]" />;
                  })()}
                </motion.div>
                <p className="mono mt-8 text-xs text-[#f2f2f2]">STEP {active + 1} OF 7</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-[#f4f4f4]">
                  {flowSteps[active].title}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#939393]">
                  {flowSteps[active].detail}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-2">
                  <StatusPill tone="green">Private by default</StatusPill>
                  {active >= 4 && <StatusPill tone="violet">Explicit consent</StatusPill>}
                  {active === 6 && <StatusPill tone="amber">Leaderboard eligible</StatusPill>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <RedesignedFooter />
    </div>
  );
}

export function PrivacyPage() {
  const rules = [
    { icon: MousePointer2, t: "You start tracking", d: "Sprintly never assumes every open editor window is work. Recording starts only after a deliberate action." },
    { icon: EyeOff, t: "Your code stays yours", d: "Sprintly measures aggregate activity. It does not collect source code, terminal content, secrets, or keystrokes." },
    { icon: HardDrive, t: "Local is a complete mode", d: "Use sessions, streaks, and local review without creating an account or enabling network access." },
    { icon: Cloud, t: "Sync has a boundary", d: "The extension sends selected categories through an authenticated API. The website cannot inspect arbitrary VS Code storage." },
    { icon: Globe2, t: "Public is a second choice", d: "Synced does not mean public. Leaderboards and profile sharing have their own explicit controls." },
  ];

  return (
    <div className="noise min-h-dvh">
      <PublicNav />
      <main>
        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[980px] text-center">
            <StatusPill tone="green">
              <LockKeyhole className="size-3.5" /> Privacy is product architecture
            </StatusPill>
            <h1 className="text-balance mt-7 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">
              Private by default is a behavior, not a promise.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#9c9c9c]">
              Every Sprintly state tells you where your activity lives, what is synchronized, and what can be shared.
            </p>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-[980px] border-t border-white/[.08]">
            {rules.map(({ icon: Icon, t, d }, i) => (
              <motion.div
                {...reveal}
                key={t}
                className="grid gap-5 border-b border-white/[.08] py-8 sm:grid-cols-[72px_1fr_1.2fr] sm:items-start"
              >
                <span className="mono text-sm text-[#656565]">0{i + 1}</span>
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-[#d6d6d6]" />
                  <h2 className="text-lg font-semibold text-[#f4f4f4]">{t}</h2>
                </div>
                <p className="text-sm leading-6 text-[#939393]">{d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto grid max-w-[980px] gap-3 md:grid-cols-3">
            {[
              ["Local data", "On your device only", "gray"],
              ["Synced", "Encrypted in your Sprintly account", "violet"],
              ["Leaderboard eligible", "Explicitly shared aggregates", "amber"],
            ].map(([t, d, tone]) => (
              <div key={t} className="panel p-5">
                <StatusPill tone={tone as "gray" | "violet" | "amber"}>{t}</StatusPill>
                <p className="mt-8 text-sm text-[#989898]">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <RedesignedFooter />
    </div>
  );
}

const plans = [
  {
    name: "Free (Local-First)",
    price: "$0",
    note: "For building the habit with total privacy",
    features: [
      "Unlimited local sessions",
      "Full local DevScore computation",
      "Core streaks & milestone badges",
      "Export & import canonical JSON",
      "Zero account or cloud required",
    ],
    cta: "Start locally",
    featured: false,
  },
  {
    name: "Pro Engineer",
    price: "$8",
    note: "For understanding rhythm & multi-machine sync",
    features: [
      "Multi-device authenticated sync",
      "Circadian focus & chrono analytics",
      "Sprint goals & milestone replays",
      "Shareable verified summary cards",
      "AI vs manual balance telemetry",
      "Community leaderboard eligibility",
    ],
    cta: "Try Pro",
    featured: true,
  },
  {
    name: "Engineering Teams",
    price: "Custom",
    note: "For engineering groups seeking sustainable momentum",
    features: [
      "Aggregate team focus pulse",
      "Meeting debt & cognitive thrash reduction",
      "Shared sprint retrospectives",
      "Zero individual surveillance guarantee",
      "Enterprise air-gapped deployment",
    ],
    cta: "Explore Team Mode",
    featured: false,
  },
];

export function PricingPage() {
  return (
    <div className="noise min-h-dvh">
      <PublicNav />
      <main className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-3xl">
            <p className="mono text-xs uppercase tracking-[.2em] text-[#f2f2f2]">Simple, transparent plans</p>
            <h1 className="text-balance mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">
              Start local. Upgrade when history becomes insight.
            </h1>
            <p className="mt-6 text-lg text-[#989898]">
              Core tracking never depends on a subscription or a cloud server.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`panel relative flex min-h-[500px] flex-col p-6 sm:p-8 ${
                  p.featured
                    ? "border-[#7C6CF2]/60 shadow-[0_24px_80px_rgba(124,108,242,0.15)]"
                    : ""
                }`}
              >
                {p.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#7C6CF2] px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <p className="mono text-xs uppercase tracking-[.16em] text-[#8b8b8b]">{p.name}</p>
                <p className="mono mt-6 text-4xl font-semibold tracking-[-.05em] text-[#f4f4f4]">
                  {p.price}
                  {p.price.startsWith("$") && <span className="text-sm font-normal text-[#797979]"> / month</span>}
                </p>
                <p className="mt-3 text-xs leading-5 text-[#919191]">{p.note}</p>
                <div className="my-7 h-px bg-white/[.08]" />
                <ul className="space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-xs text-[#b7b7b7]">
                      <Check className="size-4 shrink-0 text-[#36C98F]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className={`mt-auto inline-flex min-h-12 items-center justify-center rounded-xl text-xs font-semibold transition ${
                    p.featured
                      ? "bg-[#f2f2f2] text-[#0b0b0b] hover:bg-white"
                      : "border border-white/10 bg-white/[.04] text-[#d7d7d7] hover:bg-white/[.08]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#36C98F]/20 bg-[#36C98F]/[0.03] p-4 text-xs text-[#a4a4a4]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#36C98F]" />
            <p>
              Subscription status never changes what the extension records locally. Synchronization categories remain completely under your control on every plan.
            </p>
          </div>
        </div>
      </main>
      <RedesignedFooter />
    </div>
  );
}
