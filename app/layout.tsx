import type { Metadata, Viewport } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "@/components/ui/pixel-swap.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Sprintly — Make progress visible", template: "%s — Sprintly" },
  description: "Private, local-first coding activity and developer progress.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#080808",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
