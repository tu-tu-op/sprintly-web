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

const IconGoogle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.9999 12.24C21.9999 11.4933 21.9333 10.76 21.8066 10.0533H12.3333V14.16H17.9533C17.7333 15.3467 17.0133 16.3733 15.9666 17.08V19.68H19.5266C21.1933 18.16 21.9999 15.4533 21.9999 12.24Z" fill="#4285F4" />
    <path d="M12.3333 22C15.2333 22 17.6866 21.0533 19.5266 19.68L15.9666 17.08C15.0199 17.7333 13.7933 18.16 12.3333 18.16C9.52659 18.16 7.14659 16.28 6.27992 13.84H2.59326V16.5133C4.38659 20.0267 8.05992 22 12.3333 22Z" fill="#34A853" />
    <path d="M6.2799 13.84C6.07324 13.2267 5.9599 12.58 5.9599 11.92C5.9599 11.26 6.07324 10.6133 6.2799 10L2.59326 7.32667C1.86659 8.78667 1.45326 10.32 1.45326 11.92C1.45326 13.52 1.86659 15.0533 2.59326 16.5133L6.2799 13.84Z" fill="#FBBC05" />
    <path d="M12.3333 5.68C13.8933 5.68 15.3133 6.22667 16.3866 7.24L19.6 4.02667C17.68 2.29333 15.2266 1.33333 12.3333 1.33333C8.05992 1.33333 4.38659 3.97333 2.59326 7.32667L6.27992 10C7.14659 7.56 9.52659 5.68 12.3333 5.68Z" fill="#EA4335" />
  </svg>
);

const IconApple = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/80" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.482 15.334C16.274 16.146 15.238 17.554 15.238 19.138C15.238 21.694 17.062 22.846 19.33 22.99C21.682 23.122 23.53 21.73 23.53 19.138C23.53 16.57 21.742 15.334 19.438 15.334C18.23 15.334 17.482 15.334 17.482 15.334ZM19.438 1.018C17.074 1.018 15.238 2.41 15.238 4.982C15.238 7.554 17.062 8.702 19.33 8.842C21.682 8.974 23.53 7.582 23.53 4.982C23.518 2.41 21.742 1.018 19.438 1.018Z" />
  </svg>
);

const IconMicrosoft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 2H2v9.4h9.4V2Z" fill="#F25022" />
    <path d="M22 2h-9.4v9.4H22V2Z" fill="#7FBA00" />
    <path d="M11.4 12.6H2V22h9.4V12.6Z" fill="#00A4EF" />
    <path d="M22 12.6h-9.4V22H22V12.6Z" fill="#FFB900" />
  </svg>
);

const IconFigma = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" fill="#2C2C2C" />
    <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5V7z" fill="#0ACF83" />
    <path d="M12 12a5 5 0 0 1-5-5 5 5 0 0 1 5-5v10z" fill="#A259FF" />
    <path d="M12 17a5 5 0 0 1-5-5h10a5 5 0 0 1-5 5z" fill="#F24E1E" />
    <path d="M7 12a5 5 0 0 0 5 5v-5H7z" fill="#FF7262" />
  </svg>
);

const IconGitHub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/80" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const IconSlack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="#36C5F0" /><path d="M9 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#2EB67D" /><path d="M14 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" fill="#ECB22E" /><path d="M15.5 15a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" fill="#E01E5A" /><path d="M10 14h4v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5V14Z" fill="#E01E5A" /><path d="M8.5 14a1.5 1.5 0 0 0 1.5 1.5h1.5v-1a1.5 1.5 0 0 0-1.5-1.5H8.5v1Z" fill="#ECB22E" /><path d="M15.5 10a1.5 1.5 0 0 0-1.5-1.5H12.5v4a1.5 1.5 0 0 0 1.5 1.5h1.5v-4Z" fill="#36C5F0" /><path d="M14 8.5a1.5 1.5 0 0 0-1.5-1.5h-1v4a1.5 1.5 0 0 0 1.5 1.5h1v-4Z" fill="#2EB67D" />
  </svg>
);

const IconNotion = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/80" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm.111 5.889h3.222v10.222h-3.222V7.889zm-4.333 0h3.222v10.222H7.778V7.889z" />
  </svg>
);

const IconVercel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/90" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22h20L12 2z" />
  </svg>
);

const IconStripe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#635BFF" /><path d="M6 7H18V9H6V7Z" fill="white" /><path d="M6 11H18V13H6V11Z" fill="white" /><path d="M6 15H14V17H6V15Z" fill="white" />
  </svg>
);

const IconDiscord = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.482a1.88 1.88 0 0 0-1.635-.482C17.398 3.42 16.02 3 12 3s-5.398.42-6.682 1.001a1.88 1.88 0 0 0-1.635.483c-1.875 1.2-2.325 3.61-1.568 5.711 1.62 4.47 5.063 7.8 9.885 7.8s8.265-3.33 9.885-7.8c.757-2.1-.307-4.51-1.568-5.711ZM8.45 13.4c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65c.825 0 1.5.75 1.5 1.65s-.675 1.65-1.5 1.65Zm7.1 0c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65 1.5.75 1.5 1.65-.675 1.65-1.5 1.65Z" fill="#5865F2" />
  </svg>
);

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" className="text-foreground/90" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zM17.03 19.75h1.866L7.156 4.25H5.16l11.874 15.5z" />
  </svg>
);

const IconSpotify = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.125 14.175c-.188.3-.563.413-.863.225-2.437-1.5-5.5-1.725-9.15-1.012-.338.088-.675-.15-.763-.488-.088-.337.15-.675.488-.762 3.937-.787 7.287-.525 9.975 1.125.3.187.412.562.225.862zm.9-2.7c-.225.363-.675.488-1.037.263-2.7-1.65-6.825-2.1-9.975-1.162-.413.113-.825-.15-1-.562-.15-.413.15-.825.563-1 .362-.112 3.487-.975 6.6 1.312.362.225.487.675.262 1.038v.112zm.113-2.887c-3.225-1.875-8.55-2.025-11.512-1.125-.487.15-.975-.15-1.125-.637-.15-.488.15-.975.638-1.125 3.337-.975 9.15-.787 12.825 1.312.45.263.6.825.337 1.275-.263.45-.825.6-1.275.337v-.038z" fill="#1DB954" />
  </svg>
);

const IconDropbox = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8l-6 4 6 4 6-4-6-4z" fill="#0061FF" /><path d="M6 12l6 4 6-4-6-4-6 4z" fill="#007BFF" /><path d="M12 16l6-4-6-4-6 4 6 4z" fill="#4DA3FF" /><path d="M18 12l-6-4-6 4 6 4 6-4z" fill="#0061FF" />
  </svg>
);

const IconTwitch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.149 0L.707 3.028v17.944h5.66v3.028h3.028l3.028-3.028h4.243l7.07-7.07V0H2.15zm19.799 13.434l-3.535 3.535h-4.95l-3.029 3.029v-3.03H5.14V1.414h16.808v12.02z" fill="#9146FF" /><path d="M15.53 5.303h2.12v6.36h-2.12v-6.36zm-4.95 0h2.12v6.36h-2.12v-6.36z" fill="#9146FF" />
  </svg>
);

const IconLinear = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="linear-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#5E5CE6" /><stop offset="100%" stopColor="#2C2C2C" /></linearGradient></defs><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-4 9h8v2H8v-2z" fill="url(#linear-grad)" />
  </svg>
);

const IconYouTube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.582 6.186A2.482 2.482 0 0 0 19.82 4.42C18.1 4 12 4 12 4s-6.1 0-7.82.42c-.98.26-1.74.98-1.762 1.766C2 7.94 2 12 2 12s0 4.06.418 5.814c.022.786.782 1.506 1.762 1.766C6.1 20 12 20 12 20s6.1 0 7.82-.42c.98-.26 1.74-.98 1.762-1.766C22 16.06 22 12 22 12s0-4.06-.418-5.814zM9.75 15.5V8.5L15.75 12 9.75 15.5z" fill="#FF0000" />
  </svg>
);

const heroFloatingIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: IconGoogle, className: "left-[10%] top-[10%] opacity-60" },
  { id: 2, icon: IconApple, className: "right-[8%] top-[20%] opacity-55" },
  { id: 3, icon: IconMicrosoft, className: "left-[10%] top-[80%] opacity-50" },
  { id: 4, icon: IconFigma, className: "right-[10%] bottom-[10%] opacity-55" },
  { id: 5, icon: IconGitHub, className: "left-[30%] top-[5%] opacity-45" },
  { id: 6, icon: IconSlack, className: "right-[30%] top-[5%] opacity-50" },
  { id: 7, icon: IconVercel, className: "left-[25%] bottom-[8%] opacity-45" },
  { id: 8, icon: IconStripe, className: "left-[15%] top-[40%] opacity-55" },
  { id: 9, icon: IconDiscord, className: "right-[25%] top-[75%] opacity-55" },
  { id: 10, icon: IconX, className: "left-[70%] top-[90%] opacity-45" },
  { id: 11, icon: IconNotion, className: "right-[5%] top-[50%] opacity-50" },
  { id: 12, icon: IconSpotify, className: "left-[5%] top-[55%] opacity-55" },
  { id: 13, icon: IconDropbox, className: "left-[55%] top-[5%] opacity-50" },
  { id: 14, icon: IconTwitch, className: "right-[45%] bottom-[5%] opacity-50" },
  { id: 15, icon: IconLinear, className: "right-[20%] top-[25%] opacity-50" },
  { id: 16, icon: IconYouTube, className: "left-[30%] top-[60%] opacity-50" },
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
