import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/components/ui/pixel-swap.css";
import { Providers } from "@/components/providers";

// Self-hosted via next/font: preloaded, swap display, metric-compatible
// fallbacks (no layout shift), and no extra render-blocking CSS imports.
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-src-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-src-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://sprintly.app"),
  title: { default: "Sprintly — Make progress visible", template: "%s — Sprintly" },
  description: "Private, local-first coding activity and developer progress. Import your extension sessions, see streaks, focus, and a versioned Dev Score — shared only when you choose.",
  applicationName: "Sprintly",
  keywords: ["developer analytics", "coding tracker", "dev score", "streaks", "local first", "VS Code extension"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Sprintly",
    title: "Sprintly — Make progress visible",
    description: "Private, local-first coding activity and developer progress.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprintly — Make progress visible",
    description: "Private, local-first coding activity and developer progress.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#080808",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${jetbrainsMono.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
