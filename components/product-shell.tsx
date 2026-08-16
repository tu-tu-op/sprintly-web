"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BarChart3, Bell, CheckCircle2, ChevronRight,
  CreditCard, Flame, Goal, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen,
  FileUp, Search, Settings, Target, Timer, Trophy, UserRound, UsersRound, X,
} from "lucide-react";
import { Brand, SprintlyMark } from "./brand";
import { useSprintlyStore } from "@/lib/store";

const nav = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Workspace", href: "/app/workspace", icon: Target },
  { label: "Sessions", href: "/app/sessions", icon: Timer },
  { label: "Recap", href: "/app/analytics", icon: BarChart3 },
  { label: "Achievements", href: "/app/achievements", icon: Trophy },
  { label: "Goals", href: "/app/goals", icon: Goal },
  { label: "Profile", href: "/app/profile", icon: UserRound },
  { label: "Leaderboard", href: "/app/community", icon: UsersRound },
  { label: "Settings", href: "/app/settings", icon: Settings },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
];

const commands = [
  { label: "Go to overview", hint: "G O", href: "/app", icon: LayoutDashboard },
  { label: "Open workspace", hint: "G W", href: "/app/workspace", icon: Target },
  { label: "View recap", hint: "G A", href: "/app/analytics", icon: BarChart3 },
  { label: "View achievements", hint: "G H", href: "/app/achievements", icon: Trophy },
  { label: "Create a goal", hint: "N G", href: "/app/goals", icon: Goal },
  { label: "Search sessions", hint: "G S", href: "/app/sessions", icon: Search },
  { label: "Open settings", hint: "G ,", href: "/app/settings", icon: Settings },
];

function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, setMobileOpen } = useSprintlyStore();
  const isCollapsed = collapsed && !mobile;
  return <div className="flex h-full flex-col p-3">
    <div className={`flex min-h-12 items-center ${isCollapsed ? "justify-center" : "justify-between px-1"}`}>
      {isCollapsed ? <Link href="/app" aria-label="Sprintly overview"><SprintlyMark className="size-8"/></Link> : <Brand />}
      {!mobile && <button onClick={toggleCollapsed} aria-label={isCollapsed?"Expand sidebar":"Collapse sidebar"} className="grid size-10 place-items-center rounded-lg text-[#7d7d7d] transition hover:bg-white/[.05] hover:text-white">{isCollapsed?<PanelLeftOpen className="size-4"/>:<PanelLeftClose className="size-4"/>}</button>}
      {mobile && <button onClick={()=>setMobileOpen(false)} aria-label="Close navigation" className="grid size-11 place-items-center rounded-lg text-[#959595]"><X className="size-5"/></button>}
    </div>
    <nav className="mt-5 space-y-1" aria-label="Product navigation">{nav.map(({label,href,icon:Icon})=>{const active=href==="/app"?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} onClick={()=>mobile&&setMobileOpen(false)} title={isCollapsed?label:undefined} aria-current={active?"page":undefined} className={`group flex min-h-11 items-center rounded-lg text-sm transition ${isCollapsed?"justify-center px-0":"gap-3 px-3"} ${active?"bg-[#f2f2f2]/12 text-[#e6e6e6]":"text-[#8b8b8b] hover:bg-white/[.045] hover:text-[#dcdcdc]"}`}><Icon aria-hidden="true" className={`size-[18px] shrink-0 ${active?"text-[#d6d6d6]":"text-[#737373] group-hover:text-[#a1a1a1]"}`}/>{!isCollapsed&&<span>{label}</span>}{active&&!isCollapsed&&<span className="ml-auto size-1.5 rounded-full bg-[#f2f2f2]"/>}</Link>})}</nav>
    <div className="mt-auto space-y-2">
      <div className={`rounded-xl border border-[#d0d0d0]/15 bg-[#d0d0d0]/[.045] ${isCollapsed?"grid min-h-11 place-items-center":"p-3"}`} title={isCollapsed?"Sync up to date":undefined}>{isCollapsed?<CheckCircle2 className="size-4 text-[#d0d0d0]"/>:<><div className="flex items-center gap-2 text-xs font-medium text-[#c3c3c3]"><CheckCircle2 className="size-4"/> Sync up to date</div><p className="mt-2 text-[11px] leading-5 text-[#7b7b7b]">18 sessions selected</p></>}</div>
      <Link href="/app/profile" className={`flex min-h-12 items-center rounded-xl border border-white/[.07] bg-white/[.025] ${isCollapsed?"justify-center":"gap-3 p-2"}`}><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#f2f2f2] to-[#bdbdbd] text-xs font-semibold">MR</div>{!isCollapsed&&<><div className="min-w-0"><p className="truncate text-xs font-medium">Maya Rios</p><p className="truncate text-[10px] text-[#797979]">Premium · Lvl 12</p></div><ChevronRight className="ml-auto size-4 text-[#6a6a6a]"/></>}</Link>
    </div>
  </div>;
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v:boolean)=>void }) {
  const [query,setQuery]=useState(""); const router=useRouter();
  const filtered=commands.filter(c=>c.label.toLowerCase().includes(query.toLowerCase()));
  const choose=(href:string)=>{onOpenChange(false);setQuery("");router.push(href)};
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"/><Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-[18%] z-[100] w-[calc(100%-24px)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"><Dialog.Title className="sr-only">Command palette</Dialog.Title><div className="flex items-center gap-3 border-b border-white/[.08] px-4"><Search className="size-4 text-[#7a7a7a]"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Sprintly or type a command…" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#676767]"/><kbd className="mono rounded border border-white/10 bg-white/[.04] px-1.5 py-1 text-[10px] text-[#7a7a7a]">ESC</kbd></div><div className="max-h-[360px] overflow-y-auto p-2"><p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#666666]">Quick routes</p>{filtered.map(({label,hint,href,icon:Icon})=><button key={label} onClick={()=>choose(href)} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-[#c2c2c2] transition hover:bg-white/[.06] hover:text-white"><Icon className="size-4 text-[#f2f2f2]"/><span>{label}</span><kbd className="mono ml-auto text-[10px] text-[#686868]">{hint}</kbd></button>)}{!filtered.length&&<p className="p-8 text-center text-sm text-[#7d7d7d]">No command found</p>}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

function Notifications(){return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button aria-label="Open notifications" className="relative grid size-11 place-items-center rounded-lg border border-white/[.07] bg-white/[.025] text-[#989898] transition hover:bg-white/[.06] hover:text-white"><Bell className="size-[18px]"/><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#9a9a9a]"/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={8} className="z-[80] w-[min(360px,calc(100vw-24px))] rounded-xl border border-white/10 bg-[#151515] p-2 shadow-2xl"><div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-semibold">Notifications</p><span className="text-[10px] text-[#f2f2f2]">3 new</span></div>{[[Flame,"12-day streak continued","You crossed 2h of focus today."],[Trophy,"Achievement unlocked","Precision Run · rare"],[CheckCircle2,"Sync complete","18 sessions are up to date."]].map(([Icon,t,d],i)=>{const C=Icon as typeof Flame;return <DropdownMenu.Item key={String(t)} className="flex gap-3 rounded-lg p-3 outline-none transition hover:bg-white/[.05]"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${i===0?"bg-[#9a9a9a]/10 text-[#9a9a9a]":i===1?"bg-[#f2f2f2]/10 text-[#d2d2d2]":"bg-[#d0d0d0]/10 text-[#d0d0d0]"}`}><C className="size-4"/></div><div><p className="text-xs font-medium text-[#dbdbdb]">{String(t)}</p><p className="mt-1 text-[11px] text-[#7e7e7e]">{String(d)}</p></div></DropdownMenu.Item>})}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>}

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { collapsed,mobileOpen,setMobileOpen }=useSprintlyStore();
  const router = useRouter();
  const [palette,setPalette]=useState(false);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setPalette(v=>!v)}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
  const onImport=()=>router.push("/app/settings");
  if (pathname === "/app") return <>{children}</>;
  return <div className="noise min-h-dvh bg-[#0a0a0a]"><aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/[.07] bg-[#0d0d0d] transition-[width] duration-300 lg:block ${collapsed?"w-[76px]":"w-[248px]"}`}><SidebarContent/></aside>
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"/><Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-[70] w-[288px] border-r border-white/10 bg-[#0d0d0d] lg:hidden"><Dialog.Title className="sr-only">Navigation</Dialog.Title><SidebarContent mobile/></Dialog.Content></Dialog.Portal></Dialog.Root>
    <div className={`transition-[padding] duration-300 ${collapsed?"lg:pl-[76px]":"lg:pl-[248px]"}`}><header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[.07] bg-[#0a0a0a]/90 px-3 backdrop-blur-xl sm:px-5"><button onClick={()=>setMobileOpen(true)} aria-label="Open navigation" className="grid size-11 place-items-center rounded-lg border border-white/[.07] text-[#989898] lg:hidden"><Menu className="size-5"/></button><button onClick={()=>setPalette(true)} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/[.07] bg-white/[.02] px-3 text-left text-sm text-[#757575] transition hover:border-white/[.12] hover:bg-white/[.04] sm:max-w-md"><Search className="size-4 shrink-0"/><span className="truncate">Search sessions, tasks, goals…</span><kbd className="mono ml-auto hidden rounded border border-white/[.08] bg-white/[.03] px-1.5 py-1 text-[10px] text-[#6b6b6b] sm:block">⌘ K</kbd></button><div className="ml-auto flex items-center gap-2"><button onClick={onImport} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f2f2f2] px-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#ededed] sm:px-4"><FileUp className="size-4"/><span className="hidden sm:inline">Import data</span></button><Notifications/></div></header><main id="main-content" tabIndex={-1} className="mx-auto min-h-[calc(100dvh-64px)] max-w-[1500px] p-4 pb-24 sm:p-6 lg:p-8">{children}</main></div><CommandPalette open={palette} onOpenChange={setPalette}/></div>;
}
