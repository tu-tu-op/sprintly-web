"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Separator from "@radix-ui/react-separator";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand, SprintlyMark } from "./brand";
import { clearAuthSession } from "@/lib/sprintly/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Workspace", href: "/app/workspace", icon: Target },
  { label: "Sessions", href: "/app/sessions", icon: Timer },
  { label: "Recap", href: "/app/analytics", icon: BarChart3 },
  { label: "Achievements", href: "/app/achievements", icon: Trophy },
  { label: "Leaderboard", href: "/app/community", icon: UsersRound },
];

function UserMenu() {
  const router = useRouter();

  const signOut = () => {
    clearAuthSession();
    router.replace("/sign-in");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex min-h-10 items-center gap-2 rounded-xl border border-[#e4e7ef] bg-white px-2.5 text-left shadow-sm transition hover:border-[#cfd4e1]" aria-label="Open account menu">
          <Avatar.Root className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#7c6cf2] to-[#32c7d9] text-[10px] font-bold text-white">
            <Avatar.Fallback>AR</Avatar.Fallback>
          </Avatar.Root>
          <span className="hidden max-w-28 truncate text-xs font-semibold text-[#263044] sm:block">Alex Rivera</span>
          <ChevronDown className="size-3.5 text-[#7f8798]" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-[100] w-56 rounded-2xl border border-[#e4e7ef] bg-white p-1.5 text-[#263044] shadow-[0_18px_48px_rgba(23,31,56,.16)]">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold">Alex Rivera</p>
            <p className="mt-0.5 text-[11px] text-[#7b8495]">@alexrivera · Bengaluru</p>
          </div>
          <Separator.Root orientation="horizontal" className="my-1 h-px bg-[#edf0f5]" />
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs outline-none hover:bg-[#f4f5fa]">
            <Link href="/app/profile"><Avatar.Root className="grid size-4 place-items-center"><Avatar.Fallback>AR</Avatar.Fallback></Avatar.Root>Profile</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs outline-none hover:bg-[#f4f5fa]">
            <Link href="/app/settings"><Settings2 className="size-4 text-[#798294]" />Settings</Link>
          </DropdownMenu.Item>
          <Separator.Root orientation="horizontal" className="my-1 h-px bg-[#edf0f5]" />
          <DropdownMenu.Item onSelect={signOut} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs text-[#d04c5b] outline-none hover:bg-[#fff1f2]">Sign out</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function NotificationMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative grid size-10 place-items-center rounded-xl border border-[#e4e7ef] bg-white text-[#687286] shadow-sm transition hover:border-[#cfd4e1] hover:text-[#364056]" aria-label="Open notifications">
          <Bell className="size-[17px]" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ee8c4a]" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-[100] w-[min(360px,calc(100vw-24px))] rounded-2xl border border-[#e4e7ef] bg-white p-2 text-[#263044] shadow-[0_18px_48px_rgba(23,31,56,.16)]">
          <div className="flex items-center justify-between px-3 py-2"><p className="text-xs font-semibold">Activity updates</p><span className="rounded-full bg-[#fff1e8] px-2 py-1 text-[10px] font-semibold text-[#c36b32]">3 new</span></div>
          {["12-day streak continued", "Precision Run unlocked", "Sync is up to date"].map((item, index) => <DropdownMenu.Item key={item} className="flex cursor-pointer gap-3 rounded-xl p-3 outline-none hover:bg-[#f6f7fb]"><span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", index === 0 ? "bg-[#fff1e8] text-[#d97838]" : index === 1 ? "bg-[#f0edff] text-[#6d5dfc]" : "bg-[#e9f8f2] text-[#1b9b6a]")}><Sparkles className="size-3.5" /></span><span><span className="block text-[11px] font-semibold">{item}</span><span className="mt-0.5 block text-[10px] text-[#7c8596]">Sprintly record updated just now.</span></span></DropdownMenu.Item>)}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Sidebar({ mobile = false, onClose, collapsed = false, onCollapsedChange }: { mobile?: boolean; onClose?: () => void; collapsed?: boolean; onCollapsedChange?: (value: boolean) => void }) {
  const pathname = usePathname();
  const compact = mobile ? false : collapsed;

  return (
    <aside className={cn("flex h-full flex-col bg-[#151a27] text-white", mobile ? "w-[286px]" : compact ? "w-[76px]" : "w-[252px]")}>
      <div className={cn("flex min-h-[72px] items-center", compact ? "justify-center px-3" : "justify-between px-5")}>
        {compact ? <Link href="/app" aria-label="Sprintly overview"><SprintlyMark className="size-8" /></Link> : <Brand />}
        {mobile ? <button onClick={onClose} aria-label="Close navigation" className="grid size-10 place-items-center rounded-xl text-[#aeb6c8] hover:bg-white/10"><X className="size-5" /></button> : <Collapsible.Root open={!collapsed} onOpenChange={(open) => onCollapsedChange?.(!open)}><Collapsible.Trigger asChild><button aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} className="grid size-9 place-items-center rounded-lg text-[#8c96ab] transition hover:bg-white/10 hover:text-white">{compact ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}</button></Collapsible.Trigger></Collapsible.Root>}
      </div>
      <Separator.Root orientation="horizontal" className="h-px bg-white/[.08]" />
      <div className={cn("px-3 pt-5", compact ? "px-2" : "")}>
        {!compact && <p className="px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#69738a]">Workspace</p>}
        <nav className="mt-3 space-y-1" aria-label="Sprintly navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = href === "/app" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} onClick={onClose} aria-current={active ? "page" : undefined} title={compact ? label : undefined} className={cn("group flex min-h-11 items-center rounded-xl text-xs font-medium transition", compact ? "justify-center px-0" : "gap-3 px-3", active ? "bg-[#7464f5] text-white shadow-[0_8px_20px_rgba(116,100,245,.25)]" : "text-[#aab2c3] hover:bg-white/[.07] hover:text-white")}><Icon className={cn("size-[17px] shrink-0", active ? "text-white" : "text-[#8490a6] group-hover:text-white")} aria-hidden="true" />{!compact && <span>{label}</span>}{active && !compact && <span className="ml-auto size-1.5 rounded-full bg-white/90" />}</Link>;
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-3 p-3">
        {!compact && <div className="rounded-2xl border border-[#36c98f]/20 bg-[#36c98f]/[.08] p-3"><div className="flex items-center gap-2 text-[11px] font-semibold text-[#80deb6]"><ShieldCheck className="size-3.5" /> Local boundary active</div><p className="mt-1.5 text-[10px] leading-4 text-[#8caa9f]">Your sessions stay private until you choose to sync.</p></div>}
        <Link href="/app/profile" title={compact ? "Alex Rivera" : undefined} className={cn("flex min-h-12 items-center rounded-xl border border-white/[.08] bg-white/[.04]", compact ? "justify-center" : "gap-3 px-2.5")}><Avatar.Root className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#7c6cf2] to-[#32c7d9] text-[10px] font-bold"><Avatar.Fallback>AR</Avatar.Fallback></Avatar.Root>{!compact && <><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">Alex Rivera</span><span className="mt-0.5 block truncate text-[10px] text-[#7d879b]">Premium · Lvl 12</span></span><ChevronRight className="size-3.5 text-[#748097]" /></>}</Link>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return <div className="min-h-dvh bg-[#f7f8fb] text-[#263044]">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block"><div className={cn("h-full transition-[width] duration-200", collapsed ? "w-[76px]" : "w-[252px]")}><Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} /></div></div>
    <div className={cn("fixed inset-y-0 left-0 z-[80] transition-transform duration-200 lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}><Sidebar mobile collapsed={false} onClose={() => setMobileOpen(false)} /></div>
    {mobileOpen && <button className="fixed inset-0 z-[70] bg-[#111827]/45 lg:hidden" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} />}
    <div className={cn("min-h-dvh transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[252px]")}>
      <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#e5e7ef] bg-[#f7f8fb]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl border border-[#e2e5ed] bg-white text-[#687286] shadow-sm lg:hidden"><Menu className="size-[18px]" /></button>
        <div className="hidden items-center gap-2 text-xs text-[#7e8798] sm:flex"><span>Workspace</span><ChevronRight className="size-3.5" /><span className="font-semibold text-[#263044]">{pathname === "/app" ? "Overview" : "Sprintly"}</span></div>
        <button className="ml-auto flex min-h-10 w-full max-w-[290px] items-center gap-2 rounded-xl border border-[#e2e5ed] bg-white px-3 text-left text-xs text-[#9aa2b1] shadow-sm transition hover:border-[#cfd4e1] sm:ml-6"><Search className="size-4 shrink-0" /><span className="truncate">Search your record</span><kbd className="mono ml-auto hidden rounded-md border border-[#e5e7ef] bg-[#f8f9fb] px-1.5 py-1 text-[9px] text-[#8e96a6] sm:block">⌘ K</kbd></button>
        <div className="flex items-center gap-2"><NotificationMenu /><UserMenu /></div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1560px] p-4 pb-16 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
