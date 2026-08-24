import type { Metadata, Viewport } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "@/components/ui/pixel-swap.css";
import { Providers } from "@/components/providers";

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
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
