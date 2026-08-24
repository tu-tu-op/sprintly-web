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
import { clearAuthSession } from "@/lib/sprintly/auth";
import { cn } from "@/lib/utils";
import { Brand, SprintlyMark } from "./brand";
import { useShellState } from "./shell-state";

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
  const { displayName, initials, handle, location } = useShellState();

  const signOut = () => {
    clearAuthSession();
    router.replace("/sign-in");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex min-h-10 items-center gap-2 rounded-lg border border-white/[.1] bg-[#1a1a1a] px-2.5 text-left text-[#f4f4f4] transition hover:border-white/[.18] hover:bg-white/[.07]" aria-label="Open account menu">
          <Avatar.Root className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f3f3] to-[#707070] text-[10px] font-bold text-[#0b0b0b]">
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <span className="hidden max-w-28 truncate text-xs font-semibold text-[#f4f4f4] sm:block">{displayName}</span>
          <ChevronDown className="size-3.5 text-[#929292]" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-[100] w-56 rounded-xl border border-white/[.1] bg-[#121212] p-1.5 text-[#f4f4f4] shadow-2xl">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold">{displayName}</p>
            <p className="mt-0.5 text-[11px] text-[#929292]">@{handle} · {location}</p>
          </div>
          <Separator.Root orientation="horizontal" className="my-1 h-px bg-white/[.1]" />
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs outline-none hover:bg-white/[.06]">
            <Link href="/app/profile"><Avatar.Root className="grid size-4 place-items-center"><Avatar.Fallback>{initials}</Avatar.Fallback></Avatar.Root>Profile</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs outline-none hover:bg-white/[.06]">
            <Link href="/app/settings"><Settings2 className="size-4 text-[#929292]" />Settings</Link>
          </DropdownMenu.Item>
          <Separator.Root orientation="horizontal" className="my-1 h-px bg-white/[.1]" />
          <DropdownMenu.Item onSelect={signOut} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs text-[#c8c8c8] outline-none hover:bg-white/[.06]">Sign out</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const NOTIFICATION_ICONS = { streak: Sparkles, achievement: Trophy, storage: ShieldCheck } as const;

function NotificationMenu() {
  const { notifications } = useShellState();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="grid size-10 place-items-center rounded-lg border border-white/[.1] bg-[#1a1a1a] text-[#929292] transition hover:border-white/[.18] hover:bg-white/[.07] hover:text-[#f4f4f4]" aria-label="Open activity updates">
          <Bell className="size-[17px]" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-[100] w-[min(360px,calc(100vw-24px))] rounded-xl border border-white/[.1] bg-[#121212] p-2 text-[#f4f4f4] shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2"><p className="text-xs font-semibold">Activity updates</p><span className="rounded-full bg-white/[.1] px-2 py-1 text-[10px] font-semibold text-[#d6d6d6]">Local</span></div>
          {notifications.map((item) => { const Icon = NOTIFICATION_ICONS[item.kind]; return <DropdownMenu.Item key={item.id} className="flex cursor-pointer gap-3 rounded-lg p-3 outline-none hover:bg-white/[.06]"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[.1] text-[#e6e6e6]"><Icon className="size-3.5" /></span><span><span className="block text-[11px] font-semibold">{item.title}</span><span className="mt-0.5 block text-[10px] text-[#929292]">{item.description}</span></span></DropdownMenu.Item>; })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Sidebar({ mobile = false, onClose, collapsed = false, onCollapsedChange }: { mobile?: boolean; onClose?: () => void; collapsed?: boolean; onCollapsedChange?: (value: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, initials } = useShellState();
  const compact = mobile ? false : collapsed;

  return (
    <aside className={cn("flex h-full flex-col bg-[#0d0d0d] text-[#f4f4f4]", mobile ? "w-[286px]" : compact ? "w-[76px]" : "w-[248px]")}>
      <div className={cn("flex min-h-16 items-center", compact ? "justify-center px-3" : "justify-between px-5")}>
        {compact ? <Link href="/app" aria-label="Sprintly overview"><SprintlyMark className="size-8" /></Link> : <Brand />}
        {mobile ? <button onClick={onClose} aria-label="Close navigation" className="grid size-10 place-items-center rounded-lg text-[#929292] hover:bg-white/[.06]"><X className="size-5" /></button> : <Collapsible.Root open={!collapsed} onOpenChange={(open) => onCollapsedChange?.(!open)}><Collapsible.Trigger asChild><button aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} className="grid size-9 place-items-center rounded-lg text-[#929292] transition hover:bg-white/[.06] hover:text-[#f4f4f4]">{compact ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}</button></Collapsible.Trigger></Collapsible.Root>}
      </div>
      <Separator.Root orientation="horizontal" className="h-px bg-white/[.08]" />
      <div className={cn("px-3 pt-5", compact ? "px-2" : "")}>
        {!compact && <p className="px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#707070]">Workspace</p>}
        <nav className="mt-3 space-y-1" aria-label="Sprintly navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = href === "/app" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} onMouseEnter={() => router.prefetch(href)} onFocus={() => router.prefetch(href)} onClick={onClose} aria-current={active ? "page" : undefined} title={compact ? label : undefined} className={cn("group flex min-h-11 items-center rounded-lg text-xs font-medium transition", compact ? "justify-center px-0" : "gap-3 px-3", active ? "bg-[#f2f2f2] text-[#0b0b0b] shadow-[0_8px_20px_rgba(255,255,255,.1)]" : "text-[#929292] hover:bg-white/[.06] hover:text-[#f4f4f4]")}><Icon className={cn("size-[17px] shrink-0", active ? "text-[#0b0b0b]" : "text-[#777777] group-hover:text-[#f4f4f4]")} aria-hidden="true" />{!compact && <span>{label}</span>}{active && !compact && <span className="ml-auto size-1.5 rounded-full bg-[#0b0b0b]/75" />}</Link>;
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-3 p-3">
        {!compact && <div className="rounded-xl border border-white/[.12] bg-white/[.05] p-3"><div className="flex items-center gap-2 text-[11px] font-semibold text-[#e2e2e2]"><ShieldCheck className="size-3.5" /> Local boundary active</div><p className="mt-1.5 text-[10px] leading-4 text-[#919191]">Your sessions stay private until you choose to sync.</p></div>}
        <Link href="/app/profile" title={compact ? displayName : undefined} className={cn("flex min-h-12 items-center rounded-lg border border-white/[.1] bg-white/[.04]", compact ? "justify-center" : "gap-3 px-2.5")}><Avatar.Root className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f3f3] to-[#707070] text-[10px] font-bold text-[#0b0b0b]"><Avatar.Fallback>{initials}</Avatar.Fallback></Avatar.Root>{!compact && <><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{displayName}</span><span className="mt-0.5 block truncate text-[10px] text-[#828282]">Local demo account</span></span><ChevronRight className="size-3.5 text-[#747474]" /></>}</Link>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return <div className="min-h-dvh bg-[#080808] text-[#f4f4f4]">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block"><div className={cn("h-full transition-[width] duration-200", collapsed ? "w-[76px]" : "w-[248px]")}><Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} /></div></div>
    <div className={cn("fixed inset-y-0 left-0 z-[80] transition-transform duration-200 lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}><Sidebar mobile collapsed={false} onClose={() => setMobileOpen(false)} /></div>
    {mobileOpen && <button className="fixed inset-0 z-[70] bg-black/70 lg:hidden" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} />}
    <div className={cn("min-h-dvh transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[.09] bg-[#080808]/90 px-3 backdrop-blur-xl sm:px-5 lg:px-8">
        <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="grid size-11 place-items-center rounded-lg border border-white/[.1] bg-[#1a1a1a] text-[#929292] transition hover:bg-white/[.07] lg:hidden"><Menu className="size-[18px]" /></button>
        <div className="hidden items-center gap-2 text-xs text-[#929292] sm:flex"><span>Workspace</span><ChevronRight className="size-3.5" /><span className="font-semibold text-[#f4f4f4]">{pathname === "/app" ? "Overview" : "Sprintly"}</span></div>
        <button className="ml-auto flex min-h-11 w-full max-w-[290px] items-center gap-2 rounded-lg border border-white/[.1] bg-[#1a1a1a] px-3 text-left text-xs text-[#929292] transition hover:border-white/[.18] hover:bg-white/[.07] sm:ml-6"><Search className="size-4 shrink-0" /><span className="truncate">Search your record</span><kbd className="mono ml-auto hidden rounded border border-white/[.1] bg-black/10 px-1.5 py-1 text-[9px] text-[#777777] sm:block">⌘ K</kbd></button>
        <div className="flex items-center gap-2"><NotificationMenu /><UserMenu /></div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1440px] p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
