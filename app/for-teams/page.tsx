import type { Metadata } from "next";
import { TeamsPage } from "@/components/public-pages";

export const metadata: Metadata = { title: "For teams", description: "Shared engineering momentum with consent, context, and a sustainable pace." };

export default function Page() {
  return <TeamsPage />;
}
