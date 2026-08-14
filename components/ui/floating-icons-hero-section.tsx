"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FloatingIconProps {
  id: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className: string;
}

export interface FloatingIconsHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  icons: FloatingIconProps[];
}

type MousePosition = {
  x: React.MutableRefObject<number>;
  y: React.MutableRefObject<number>;
};

function useMousePosition(): MousePosition {
  const x = React.useRef(0);
  const y = React.useRef(0);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      x.current = event.clientX;
      y.current = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return { x, y };
}

function FloatingIcon({ mouse, iconData, index }: { mouse: MousePosition; iconData: FloatingIconProps; index: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const IconComponent = iconData.icon;

  React.useEffect(() => {
    const handleMouseMove = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(mouse.x.current - centerX, mouse.y.current - centerY);

      if (distance < 150) {
        const angle = Math.atan2(mouse.y.current - centerY, mouse.x.current - centerX);
        const force = (1 - distance / 150) * 50;
        x.set(-Math.cos(angle) * force);
        y.set(-Math.sin(angle) * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouse.x, mouse.y, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute", iconData.className)}
    >
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/30 bg-[#f4f2ed]/[.16] p-3 text-[#f4f2ed] shadow-[0_18px_50px_rgba(244,242,237,.12)] backdrop-blur-md md:h-20 md:w-20"
        animate={{ y: [0, -8, 0, 8, 0], x: [0, 6, 0, -6, 0], rotate: [0, 5, 0, -5, 0] }}
        transition={{
          duration: 6 + (iconData.id % 5),
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <IconComponent className="h-8 w-8 md:h-10 md:w-10" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

export function FloatingIconsBackground({
  className,
  icons,
}: {
  className?: string;
  icons: FloatingIconProps[];
}) {
  const mouse = useMousePosition();

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {icons.map((iconData, index) => (
        <FloatingIcon key={iconData.id} mouse={mouse} iconData={iconData} index={index} />
      ))}
    </div>
  );
}

const FloatingIconsHero = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & FloatingIconsHeroProps>(
  ({ className, title, subtitle, ctaText, ctaHref, icons, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("relative flex min-h-[700px] h-screen w-full items-center justify-center overflow-hidden bg-[#07080a]", className)}
        {...props}
      >
        <FloatingIconsBackground icons={icons} />
        <div className="relative z-10 px-4 text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">{subtitle}</p>
          <div className="mt-10">
            <Button asChild size="lg" className="px-8 py-6 text-base font-semibold">
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>
        </div>
      </section>
    );
  },
);

FloatingIconsHero.displayName = "FloatingIconsHero";

export { FloatingIconsHero };
