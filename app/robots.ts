import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The authenticated product area and local share/profile snapshots
        // are private surfaces and should never be crawled.
        disallow: ["/app/", "/share/", "/profile/", "/onboarding"],
      },
    ],
    sitemap: "https://sprintly.app/sitemap.xml",
  };
}
