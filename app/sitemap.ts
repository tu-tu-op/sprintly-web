import type { MetadataRoute } from "next";

const BASE_URL = "https://sprintly.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/product", "/how-it-works", "/for-teams", "/pricing", "/privacy", "/sign-in", "/create-account"];
  const lastModified = new Date();
  return routes.map((route) => ({ url: `${BASE_URL}${route}`, lastModified, changeFrequency: "monthly", priority: route === "" ? 1 : 0.6 }));
}
