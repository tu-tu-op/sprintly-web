"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grid min-h-dvh place-items-center bg-[#090909] px-6 text-center">
    <div>
      <p className="mono text-xs uppercase tracking-[.18em] text-[#f2f2f2]">Something broke</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Your record is safe — this view failed to render.</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#7d7d7d]">Local session data is untouched. Retry the view, or head back home if it keeps failing.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="inline-flex min-h-11 items-center rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b]">Try again</button>
        <a href="/" className="inline-flex min-h-11 items-center rounded-lg border border-white/[.09] px-4 text-sm text-[#cacaca]">Back home</a>
      </div>
    </div>
  </main>;
}
