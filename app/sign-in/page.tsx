import type { Metadata } from "next";
import { Suspense } from "react";
import { SprintlySignIn } from "@/components/sprintly-auth";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to your private Sprintly record of coding sessions, streaks, and progress.", robots: { index: false } };

export default function Page() { return <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#08090b] text-sm text-[#858c97]">Opening sign in…</div>}><SprintlySignIn /></Suspense>; }
