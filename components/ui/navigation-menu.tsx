"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, Navigation } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Sign in", href: "/sign-in", mobileHidden: true },
  { name: "Open app", href: "/app" },
];

const COLLAPSE_SCROLL_POSITION = 150;
const EXPAND_SCROLL_DISTANCE = 80;

export function AnimatedNavFramer() {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const isExpandedRef = React.useRef(true);
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);
  const { scrollY } = useScroll();

  const updateExpanded = React.useCallback((next: boolean) => {
    isExpandedRef.current = next;
    setIsExpanded(next);
  }, []);

  React.useEffect(() => {
    lastScrollY.current = scrollY.get();
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const isScrollingDown = latest > previous;
    const isScrollingUp = latest < previous;

    if (
      isExpandedRef.current &&
      isScrollingDown &&
      latest > COLLAPSE_SCROLL_POSITION
    ) {
      scrollPositionOnCollapse.current = latest;
      updateExpanded(false);
    } else if (
      !isExpandedRef.current &&
      isScrollingUp &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_DISTANCE
    ) {
      updateExpanded(true);
    }

    lastScrollY.current = latest;
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 h-12 sm:top-6">
      <AnimatePresence initial={false} mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded-navigation"
            initial={{ opacity: 0, y: -48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -64, scale: 0.92 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="pointer-events-auto absolute left-1/2"
          >
            <nav
              aria-label="Sprintly navigation"
              className="flex h-12 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center overflow-hidden rounded-full border border-white/10 bg-[#07080a]/85 shadow-lg shadow-black/20 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, x: -16, rotate: -90 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ type: "spring", damping: 16, stiffness: 260 }}
                className="flex shrink-0 items-center pl-4 pr-2 text-[#f4f2ed]"
              >
                <Navigation aria-hidden="true" className="size-6" />
              </motion.div>

              <div className="flex min-w-0 items-center gap-1 pr-3 sm:gap-4 sm:pr-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: -12, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 18,
                      stiffness: 280,
                      delay: 0.05 + index * 0.045,
                    }}
                    className={`whitespace-nowrap rounded-full px-1.5 py-1 text-xs font-medium text-[#9299a6] transition-colors hover:text-[#f4f2ed] sm:px-2 sm:text-sm ${
                      item.mobileHidden ? "hidden sm:inline-flex" : "inline-flex"
                    }`}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </div>
            </nav>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed-navigation"
            type="button"
            initial={{ opacity: 0, x: 56, scale: 0.65, rotate: -90 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: 32, scale: 0.7, rotate: 90 }}
            transition={{ type: "spring", damping: 18, stiffness: 320 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => updateExpanded(true)}
            aria-label="Expand navigation"
            title="Expand navigation"
            style={{ width: 48, height: 48, minWidth: 48, maxWidth: 48 }}
            className="pointer-events-auto absolute left-4 grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#07080a]/90 text-[#f4f2ed] shadow-lg shadow-black/20 backdrop-blur-sm"
          >
            <Menu aria-hidden="true" className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
