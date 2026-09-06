"use client";

import { Toaster } from "sonner";
import { CustomCursor } from "./custom-cursor";

export function Providers({ children }: { children: React.ReactNode }) {
  // Native wheel scrolling needs no perpetual RAF loop. CSS preserves smooth anchors.
  return <>{children}<CustomCursor /><Toaster theme="dark" position="bottom-right" richColors /></>;
}
