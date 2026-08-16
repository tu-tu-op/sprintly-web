"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Activity, EyeOff, Flame, TimerReset } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import {
  FloatingIconsBackground,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section";
import PixelSwap from "@/components/ui/pixel-swap";

type HeroScrollDemoProps = {
  titleComponent: ReactNode;
  afterComponent?: ReactNode;
};

const imageIcon = (src: string) => (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
    <image href={src} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

const IconGitHub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/80" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const IconDiscordLegacy = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.482a1.88 1.88 0 0 0-1.635-.482C17.398 3.42 16.02 3 12 3s-5.398.42-6.682 1.001a1.88 1.88 0 0 0-1.635.483c-1.875 1.2-2.325 3.61-1.568 5.711 1.62 4.47 5.063 7.8 9.885 7.8s8.265-3.33 9.885-7.8c.757-2.1-.307-4.51-1.568-5.711ZM8.45 13.4c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65c.825 0 1.5.75 1.5 1.65s-.675 1.65-1.5 1.65Zm7.1 0c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65 1.5.75 1.5 1.65-.675 1.65-1.5 1.65Z" fill="#5865F2" />
  </svg>
);

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/90" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zM17.03 19.75h1.866L7.156 4.25H5.16l11.874 15.5z" />
  </svg>
);

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="instagram-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse"><stop stopColor="#FFDC80" /><stop offset=".45" stopColor="#F56040" /><stop offset="1" stopColor="#833AB4" /></linearGradient></defs>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#instagram-gradient)" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="#F56040" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.25" fill="#833AB4" />
  </svg>
);

const IconTelegram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#2AABEE" />
    <path d="m5.8 11.7 11.7-4.5c.54-.2 1 .13.82.96l-1.99 9.4c-.15.67-.55.83-1.12.52l-3.1-2.28-1.5 1.45c-.17.17-.31.31-.63.31l.22-3.16 5.76-5.2c.25-.22-.06-.35-.39-.13l-7.12 4.48-3.07-.96c-.67-.21-.68-.67.42-.89Z" fill="white" />
  </svg>
);

const IconVSCode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m21.2 3.1-5.55-3.02L8.9 6.4 5.1 3.5 2.2 5.1v13.8l2.9 1.6 3.8-2.9 6.75 6.4 5.55-3.02V3.1ZM15 5.25v13.5l-5.9-5.35L15 5.25ZM4.3 7.4 8 10.55 4.3 14.5V7.4Z" fill="#007ACC" />
  </svg>
);

const IconTerminal = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="#10131A" strokeWidth="1.8" />
    <path d="m7 9 3 3-3 3M13 15h4" stroke="#7C6CF2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconAntiGravity = imageIcon("/icons/Antigravity.png");

const IconCursor = imageIcon("/icons/cursor.png");

const IconKiro = imageIcon("/icons/kiro-icon.png");

const IconClaudeCode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64 5.64 18.36" stroke="#D97757" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="#D97757" />
  </svg>
);

const IconCodex = imageIcon("/icons/codex-color.svg");

const IconDiscord = imageIcon("/icons/Discord.png");

const heroFloatingIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: IconGitHub, className: "left-[12%] top-[15%] opacity-60" },
  { id: 2, icon: IconDiscord, className: "right-[8%] top-[20%] opacity-55" },
  { id: 3, icon: IconX, className: "left-[10%] top-[80%] opacity-50" },
  { id: 4, icon: IconInstagram, className: "right-[10%] bottom-[10%] opacity-55" },
  { id: 5, icon: IconTelegram, className: "left-[10%] top-[5%] opacity-50" },
  { id: 6, icon: IconVSCode, className: "right-[10%] top-[5%] opacity-55" },
  { id: 7, icon: IconTerminal, className: "left-[25%] bottom-[8%] opacity-50" },
  { id: 8, icon: IconAntiGravity, className: "left-[15%] top-[40%] opacity-55" },
  { id: 10, icon: IconCursor, className: "left-[70%] top-[90%] opacity-50" },
  { id: 11, icon: IconKiro, className: "right-[5%] top-[50%] opacity-55" },
  { id: 12, icon: IconClaudeCode, className: "left-[10%] top-[92%] opacity-55" },
  { id: 13, icon: IconCodex, className: "right-[24%] top-[78%] opacity-80" },
];

export function HeroScrollDemo({ titleComponent, afterComponent }: HeroScrollDemoProps) {
  const [hoverEnabled, setHoverEnabled] = useState(false);

  return (
    <div className="relative">
      <FloatingIconsBackground className="z-0" icons={heroFloatingIcons} />
      <div className="relative z-10">
        <ContainerScroll
          titleComponent={titleComponent}
          onInteractionReadyChange={setHoverEnabled}
        >
        <div className="relative h-full w-full bg-[#0b0d10]">
        <PixelSwap
          className="absolute inset-0 h-full w-full"
          firstContent={
            <div className="relative h-full w-full bg-[#0b0d10]">
              <Image
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1800&q=88"
                alt="Developer workspace with code visible on a monitor"
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover object-center opacity-45"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#080a0d]/30 via-[#080a0d]/25 to-[#080a0d]/95" />
              <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#0d1015]/80 px-3 py-1.5 text-[10px] text-[#b8bec8] backdrop-blur-md sm:right-7 sm:top-7">
                {hoverEnabled ? "Hover to decode" : "Scroll to focus"}
              </div>
            </div>
          }
          secondContent={
            <div className="relative h-full w-full overflow-hidden bg-[#11101b]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(50,199,217,.2),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(124,108,242,.24),transparent_42%)]" />
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="relative flex h-full flex-col justify-center p-6 sm:p-10 md:p-12">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#7de4ba]">
                  <span className="size-1.5 rounded-full bg-[#36c98f] shadow-[0_0_14px_rgba(54,201,143,.8)]" />
                  Focus signal decoded
                </div>
                <div className="mt-6 max-w-xl">
                  <p className="mono text-xs uppercase tracking-[.18em] text-[#9b8cff]">01 / Session insight</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-.05em] text-[#f4f2ed] sm:text-5xl">
                    Momentum is a pattern you can return to.
                  </h3>
                  <p className="mt-5 max-w-lg text-sm leading-6 text-[#9ba2ae] sm:text-base">
                    Your focused work becomes a private record of rhythm, consistency, and the next session worth starting.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#9b8cff]/25 bg-[#9b8cff]/10 px-3 py-1.5 text-xs text-[#c3bbff]">12 day streak</span>
                  <span className="rounded-full border border-[#32c7d9]/25 bg-[#32c7d9]/10 px-3 py-1.5 text-xs text-[#8de2ec]">87 focus score</span>
                </div>
              </div>
            </div>
          }
          pixelSize={64}
          gap={0}
          pixelRadius={0}
          pixelSpin={0}
          pixelScale={0.35}
          duration={1400}
          pixelDuration={450}
          pattern="random"
          randomness={0}
          fade
          trigger="hover"
          hoverEnabled={hoverEnabled}
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-7 md:p-10">
          <div className="mb-5 flex items-center gap-2 text-xs text-[#b8bec8]">
            <span className="size-2 rounded-full bg-[#36c98f] shadow-[0_0_16px_rgba(54,201,143,.8)]" />
            Session complete
            <span className="mono ml-auto text-[#8b929e]">API REDESIGN</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { icon: TimerReset, label: "Focus time", value: "2h 14m" },
              { icon: Activity, label: "Focus score", value: "87" },
              { icon: Flame, label: "Current streak", value: "12 days" },
              { icon: EyeOff, label: "Data state", value: "Local" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-[#0d1015]/85 p-3 backdrop-blur-md sm:p-4"
              >
                <div className="flex items-center gap-2 text-[#9299a6]">
                  <Icon aria-hidden="true" className="size-4 text-[#9b8cff]" />
                  <span className="text-[10px] sm:text-xs">{label}</span>
                </div>
                <p className="mono mt-3 text-lg font-semibold text-white sm:text-xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
        </ContainerScroll>
        {afterComponent}
      </div>
    </div>
  );
}
