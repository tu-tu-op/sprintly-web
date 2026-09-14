import { Suspense } from "react";
import { SharePage } from "@/components/pages/share-page";

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-[#8b8b8b]">Preparing Share Studio…</div>}><SharePage /></Suspense>;
}
