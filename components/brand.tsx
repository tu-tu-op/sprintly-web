import Link from "next/link";

export function SprintlyMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="Sprintly">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#f2f2f2" />
      <path d="M9 11.5h8.6a3.4 3.4 0 0 1 0 6.8H14a3.4 3.4 0 0 0 0 6.8h9" fill="none" stroke="#0b0b0b" strokeWidth="3" strokeLinecap="round" />
      <path d="M8.5 7.5h8" stroke="#777777" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg text-white" aria-label="Sprintly home">
      <SprintlyMark className="size-8 shrink-0" />
      {!compact && <span className="text-[17px] font-semibold tracking-[-0.03em]">sprintly</span>}
    </Link>
  );
}
