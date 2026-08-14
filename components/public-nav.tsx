import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";

const links = [
  ["How it works", "/how-it-works"],
  ["Privacy", "/privacy"],
  ["Pricing", "/pricing"],
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#07080a]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Public navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md text-sm text-[#9ba1ad] transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-[#b7bbc4] hover:text-white sm:flex">Sign in</Link>
          <Link href="/app" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f4f2ed] px-4 text-sm font-semibold text-[#0b0c0e] transition-colors hover:bg-white">
            Open app <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
