import type { Metadata } from "next";
import { ProductPage } from "@/components/public-pages";

export const metadata: Metadata = { title: "Product", description: "See how Sprintly turns focused coding sessions into a private record of progress." };

export default function Page() {
  return <ProductPage />;
}
