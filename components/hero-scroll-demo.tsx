"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Activity, EyeOff, Flame, TimerReset } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

type HeroScrollDemoProps = {
  titleComponent: ReactNode;
};

export function HeroScrollDemo({ titleComponent }: HeroScrollDemoProps) {
  return (
    <ContainerScroll titleComponent={titleComponent}>
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
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7 md:p-10">
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
  );
}
