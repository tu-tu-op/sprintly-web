import { ProductShell } from "@/components/product-shell";
import { AuthGate } from "@/components/auth-gate";
import { SprintlyProvider } from "@/components/sprintly-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate><SprintlyProvider><ProductShell>{children}</ProductShell></SprintlyProvider></AuthGate>;
}
