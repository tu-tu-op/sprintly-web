"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Activity, EyeOff, Flame, TimerReset } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import PixelSwap from "@/components/ui/pixel-swap";

type HeroScrollDemoProps = {
  titleComponent: ReactNode;
  afterComponent?: ReactNode;
};

export function HeroScrollDemo({ titleComponent, afterComponent }: HeroScrollDemoProps) {
  return (
    <>
      <ContainerScroll titleComponent={titleComponent}>
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
                Click to decode
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
          trigger="click"
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
    </>
  );
}
