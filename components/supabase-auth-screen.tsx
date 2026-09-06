"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Brand } from "./brand";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type SupabaseAuthMode = "create-account" | "forgot-password" | "account-recovery" | "verify-email";

export function SupabaseAuthScreen({ mode }: { mode: SupabaseAuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isCreate = mode === "create-account";
  const isRecovery = mode === "forgot-password" || mode === "account-recovery";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError("Supabase is not configured correctly."); setBusy(false); return; }
    if (isCreate) {
      const result = await supabase.auth.signUp({ email: email.trim(), password });
      setBusy(false);
      if (result.error) { setError(result.error.message); return; }
      toast.success("Account created", { description: result.data.session ? "Your Sprintly workspace is ready." : "Check your inbox to confirm your email." });
      router.replace(result.data.session ? "/onboarding" : "/verify-email");
      return;
    }
    const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/account-recovery` });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    toast.success("Recovery email sent");
  };

  if (mode === "verify-email") return <main className="grid min-h-dvh place-items-center bg-[#090909] p-6"><div className="w-full max-w-md rounded-2xl border border-white/[.08] bg-white/[.025] p-6 text-center"><Mail className="mx-auto size-8" /><h1 className="mt-5 text-2xl font-semibold">Check your inbox</h1><p className="mt-3 text-sm leading-6 text-[#8b8b8b]">Confirm your Supabase email, then return to Sprintly and sign in.</p><Link href="/sign-in" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b]">Return to sign in <ArrowRight className="size-4" /></Link></div></main>;

  return <main className="grid min-h-dvh place-items-center bg-[#090909] p-6"><div className="w-full max-w-md"><div className="mb-8 flex items-center justify-between"><Brand /><Link href="/sign-in" className="inline-flex min-h-11 items-center gap-2 text-sm text-[#949494]"><ArrowLeft className="size-4" />Back</Link></div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#f2f2f2]">Supabase Auth</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.06em]">{isCreate ? "Start your record." : "Recover your account."}</h1><p className="mt-3 text-sm leading-6 text-[#8b8b8b]">{isCreate ? "Create the website account that will own your synchronized Sprintly data." : "We will send a secure recovery link to your email."}</p><form onSubmit={submit} className="mt-8 space-y-5"><div><label htmlFor="auth-email" className="text-xs font-medium text-[#bdbdbd]">Email address</label><input id="auth-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/[.09] bg-white/[.025] px-3 text-sm" /></div>{!isRecovery && <div><label htmlFor="auth-password" className="text-xs font-medium text-[#bdbdbd]">Password</label><div className="relative mt-2"><input id="auth-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-white/[.09] bg-white/[.025] px-3 pr-12 text-sm" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-0 grid size-12 place-items-center text-[#7a7a7a]" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>}{error && <p role="alert" className="rounded-lg border border-[#b7b7b7]/20 p-3 text-xs leading-5 text-[#bdbdbd]">{error}</p>}<button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2f2f2] text-sm font-semibold text-[#0b0b0b] disabled:opacity-50">{busy ? "Working..." : isCreate ? "Create account" : "Send recovery link"}<ArrowRight className="size-4" /></button></form><div className="mt-6 flex items-start gap-2 rounded-xl border border-[#d0d0d0]/15 p-3"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p className="text-[11px] leading-5 text-[#838383]">Authentication cookies stay in the website session. Extension tokens use a separate pairing flow.</p></div></div></main>;
}
