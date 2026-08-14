"use client";

import React, { useRef } from "react";
import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type ContainerScrollProps = {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
};

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const checkMobile = () => setIsMobile(mobileQuery.matches);

    checkMobile();
    mobileQuery.addEventListener("change", checkMobile);
    return () => mobileQuery.removeEventListener("change", checkMobile);
  }, []);

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : isMobile ? [0.72, 0.92] : [1.05, 1],
  );
  const translate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -100],
  );

  return (
    <div
      ref={containerRef}
      className="relative flex h-[56rem] items-center justify-center px-3 md:h-[72rem] md:px-10"
    >
      <div className="relative w-full py-10 md:py-40 [perspective:1000px]">
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

type HeaderProps = {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
};

export function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

type CardProps = {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
};

export function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="mx-auto -mt-8 h-[30rem] w-full max-w-5xl rounded-[26px] border border-white/15 bg-[#111318] p-2 shadow-2xl md:-mt-12 md:h-[40rem] md:rounded-[30px] md:p-5"
    >
      <div className="h-full w-full overflow-hidden rounded-[19px] bg-[#0d0f12] md:rounded-[22px]">
        {children}
      </div>
    </motion.div>
  );
}
