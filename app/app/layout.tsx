import { ProductShell } from "@/components/product-shell";
import { AuthGate } from "@/components/auth-gate";
import { DevStravaProvider } from "@/components/devstrava-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate><DevStravaProvider><ProductShell>{children}</ProductShell></DevStravaProvider></AuthGate>;
}
