import { Suspense } from "react";
import { SharePage } from "@/components/devstrava-pages";

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-[#858c97]">Preparing share card…</div>}><SharePage /></Suspense>;
}
