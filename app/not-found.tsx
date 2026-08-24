import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center bg-[#090909] px-6 text-center">
    <div>
      <p className="mono text-xs uppercase tracking-[.18em] text-[#f2f2f2]">404 · Sprintly</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">This page does not exist.</h1>
      <p className="mt-3 text-sm leading-6 text-[#7d7d7d]">The link may be outdated, or the record it pointed at lives only in another browser.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b]">Back home</Link>
        <Link href="/sign-in" className="inline-flex min-h-11 items-center rounded-lg border border-white/[.09] px-4 text-sm text-[#cacaca]">Open Sprintly</Link>
      </div>
    </div>
  </main>;
}
