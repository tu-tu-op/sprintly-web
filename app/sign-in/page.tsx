import { Suspense } from "react";
import { DevStravaSignIn } from "@/components/devstrava-auth";

export default function Page() { return <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#08090b] text-sm text-[#858c97]">Opening sign in…</div>}><DevStravaSignIn /></Suspense>; }
