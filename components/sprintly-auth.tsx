"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "./brand";
import { DEMO_CREDENTIALS, demoAuthProvider } from "@/lib/sprintly/auth";

export function SprintlySignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await demoAuthProvider.signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Demo Account signed in", { description: "Your Sprintly demo record is ready." });
    router.replace(params.get("next") || "/app");
  };

  return <main className="grid min-h-dvh bg-[#090909] lg:grid-cols-[.88fr_1.12fr]">
    <section className="flex min-h-dvh flex-col px-5 py-5 sm:px-10 lg:px-14">
      <div className="flex items-center justify-between"><Brand/><Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-[#949494] hover:text-white"><ArrowLeft className="size-4"/>Back home</Link></div>
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12">
        <p className="mono text-[11px] uppercase tracking-[.18em] text-[#f2f2f2]">Sprintly account</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.06em]">See what your work is becoming.</h1>
        <p className="mt-3 text-sm leading-6 text-[#8b8b8b]">Sign in to review explicitly imported developer sessions, history, streaks, and shareable progress.</p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div><label htmlFor="sprintly-email" className="text-xs font-medium text-[#bdbdbd]">Email</label><input id="sprintly-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-white/[.09] bg-white/[.025] px-3 text-sm outline-none focus:border-[#f2f2f2]"/></div>
          <div><label htmlFor="sprintly-password" className="text-xs font-medium text-[#bdbdbd]">Password</label><div className="relative mt-2"><input id="sprintly-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-12 w-full rounded-xl border border-white/[.09] bg-white/[.025] px-3 pr-12 text-sm outline-none focus:border-[#f2f2f2]"/><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-1 top-0 grid size-12 place-items-center text-[#7a7a7a]">{showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></div></div>
          {error && <p role="alert" className="rounded-lg border border-[#b7b7b7]/20 bg-[#b7b7b7]/[.06] p-3 text-xs leading-5 text-[#bdbdbd]">{error}</p>}
          <button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2f2f2] text-[#0b0b0b] text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Opening demo…" : "Sign in"}<ArrowRight className="size-4"/></button>
        </form>
        <div className="mt-6 rounded-2xl border border-[#f2f2f2]/25 bg-[#f2f2f2]/[.06] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#e6e6e6]"><Sparkles className="size-4 text-[#c2c2c2]"/>Demo Account</div>
          <div className="mt-3 grid gap-2 text-xs text-[#a8a8a8]"><p><span className="text-[#7d7d7d]">Email:</span> <code>{DEMO_CREDENTIALS.email}</code></p><p><span className="text-[#7d7d7d]">Password:</span> <code>{DEMO_CREDENTIALS.password}</code></p></div>
          <p className="mt-3 text-[11px] leading-5 text-[#777777]">Development-only credentials. This replaceable demo provider does not represent production authentication.</p>
        </div>
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-[#d0d0d0]/15 bg-[#d0d0d0]/[.04] p-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#d0d0d0]"/><p className="text-[11px] leading-5 text-[#838383]">The website only receives data you explicitly import or approve. It does not read VS Code storage or arbitrary local files.</p></div>
        <p className="mt-7 text-center text-xs text-[#6c6c6c]">Need a real account? <Link href="/create-account" className="text-[#d0d0d0]">View the account flow</Link></p>
      </div>
    </section>
    <aside className="relative hidden overflow-hidden border-l border-white/[.07] bg-[#0e0e0e] lg:block"><div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_32%,rgba(128,128,128,.22),transparent_45%)]"/><div className="relative flex h-full flex-col justify-center p-16"><p className="mono text-xs uppercase tracking-[.18em] text-[#bdbdbd]">Sprintly · local first</p><h2 className="mt-5 max-w-xl text-6xl font-semibold leading-[.98] tracking-[-.07em]">Your coding record, with a little competitive energy.</h2><div className="mt-12 grid max-w-xl grid-cols-2 gap-3">{[["12 days","current streak"],["18h 24m","coding this week"],["847","dev score"],["Private by default","sharing boundary"]].map(([value,label]) => <div key={label} className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><p className="mono text-2xl font-semibold">{value}</p><p className="mt-2 text-xs text-[#7a7a7a]">{label}</p></div>)}</div></div></aside>
  </main>;
}
