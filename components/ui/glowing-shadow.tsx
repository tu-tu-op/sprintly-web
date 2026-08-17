"use client";

import { type ReactNode } from "react";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
  edge?: boolean;
}

export function GlowingShadow({
  children,
  className = "",
  edge = false,
}: GlowingShadowProps) {
  const containerClassName = [
    "glow-container",
    edge && "glow-container--edge",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style jsx>{`
        @property --hue {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --rotate {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-x {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-translate-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-size {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-opacity {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-blur {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-scale {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --glow-radius {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        .glow-container {
          --card-color: hsl(260deg 100% 3%);
          --text-color: hsl(260deg 10% 55%);
          --card-radius: 3.6vw;
          --card-width: 35vw;
          --border-width: 3px;
          --bg-size: 1;
          --hue: 0;
          --hue-speed: 1;
          --rotate: 0;
          --animation-speed: 4s;
          --interaction-speed: 0.55s;
          --glow-scale: 1.5;
          --scale-factor: 1;
          --glow-blur: 6;
          --glow-opacity: 1;
          --glow-radius: 100;
          --glow-rotate-unit: 1deg;

          width: var(--card-width);
          width: min(480px, var(--card-width));
          aspect-ratio: 1.5/1;
          color: white;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          border-radius: var(--card-radius);
          cursor: default;
        }

        .glow-container:before,
        .glow-container:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: var(--card-radius);
        }

        .glow-content {
          position: absolute;
          background: var(--card-color);
          border-radius: calc(var(--card-radius) * 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: calc(var(--card-width) / 8);
        }

        .glow-content span {
          display: inline-block;
          padding: 0.25em;
          border-radius: 4px;
          margin-right: 8px;
        }

        .glow-content:before {
          content: "";
          display: block;
          position: absolute;
          width: calc(100% + var(--border-width));
          height: calc(100% + var(--border-width));
          border-radius: calc(var(--card-radius) * 0.9);
          box-shadow: 0 0 20px black;
          mix-blend-mode: color-burn;
          z-index: -1;
          background: hsl(0deg 0% 16%) radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 90%) calc(0% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 80%) calc(20% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%) calc(40% * var(--bg-size)),
            transparent 100%
          );
          animation: hue-animation var(--animation-speed) linear infinite,
            rotate-bg var(--animation-speed) linear infinite;
          transition: --bg-size var(--interaction-speed) ease;
          will-change: background;
        }

        .glow {
          --glow-translate-y: 0;
          display: block;
          position: absolute;
          width: calc(var(--card-width) / 5);
          height: calc(var(--card-width) / 5);
          animation: rotate var(--animation-speed) linear infinite;
          transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
          transform-origin: center;
          border-radius: calc(var(--glow-radius) * 10vw);
          will-change: transform;
        }

        .glow:after {
          content: "";
          display: block;
          z-index: -2;
          filter: blur(calc(var(--glow-blur) * 10px));
          width: 130%;
          height: 130%;
          left: -15%;
          top: -15%;
          background: hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%);
          position: relative;
          border-radius: calc(var(--glow-radius) * 10vw);
          animation: hue-animation var(--animation-speed) linear infinite;
          transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
            scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
            translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
          will-change: filter, opacity, transform;
        }

        .glow-container--edge {
          --card-width: 100%;
          --card-radius: 30px;
          --animation-speed: 8s;
          --edge-inset: 9px;
          --edge-content-radius: 19px;
          position: absolute;
          inset: 0;
          width: auto;
          height: auto;
          max-width: none;
          aspect-ratio: auto;
          margin: 0;
          overflow: visible;
        }

        .glow-container--edge .glow-content {
          inset: var(--edge-inset);
          width: auto;
          height: auto;
          padding: 0;
          border-radius: var(--edge-content-radius);
          mix-blend-mode: normal;
        }

        .glow-container--edge .glow-content span {
          display: initial;
          padding: 0;
          border-radius: 0;
          margin-right: 0;
        }

        .glow-container--edge .glow-content:before {
          border-radius: var(--edge-content-radius);
          background: hsl(0deg 0% 16%) radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(0deg 0% 96%) calc(0% * var(--bg-size)),
            hsl(0deg 0% 82%) calc(20% * var(--bg-size)),
            hsl(0deg 0% 62%) calc(40% * var(--bg-size)),
            transparent 100%
          );
        }

        .glow-container--edge .glow:after {
          background: hsl(0deg 0% 88%);
        }

        @media (min-width: 768px) {
          .glow-container--edge {
            --edge-inset: 21px;
            --edge-content-radius: 22px;
          }
        }

        @keyframes rotate-bg {
          0% {
            --bg-x: 0;
            --bg-y: 0;
          }
          25% {
            --bg-x: 100;
            --bg-y: 0;
          }
          50% {
            --bg-x: 100;
            --bg-y: 100;
          }
          75% {
            --bg-x: 0;
            --bg-y: 100;
          }
          100% {
            --bg-x: 0;
            --bg-y: 0;
          }
        }

        @keyframes rotate {
          from {
            --rotate: -70;
            --glow-translate-y: -65;
          }
          25% {
            --glow-translate-y: -65;
          }
          50% {
            --glow-translate-y: -65;
          }
          60%, 75% {
            --glow-translate-y: -65;
          }
          85% {
            --glow-translate-y: -65;
          }
          to {
            --rotate: calc(360 - 70);
            --glow-translate-y: -65;
          }
        }

        @keyframes hue-animation {
          0% {
            --hue: 0;
          }
          100% {
            --hue: 360;
          }
        }
      `}</style>

      <div className={containerClassName}>
        <span className="glow" aria-hidden="true" />
        <div className="glow-content">{children}</div>
      </div>
    </>
  );
}
