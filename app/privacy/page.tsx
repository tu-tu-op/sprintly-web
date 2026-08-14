import type { Metadata } from "next";
import { PrivacyPage } from "@/components/public-site";
export const metadata: Metadata = { title: "Privacy" };
export default function Page() { return <PrivacyPage />; }
