import { Suspense } from "react";
import { SharePage } from "@/components/sprintly-pages";

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-[#8b8b8b]">Preparing share card…</div>}><SharePage /></Suspense>;
}
