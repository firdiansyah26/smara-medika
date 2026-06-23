import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Area privat (butuh login) & API tidak perlu di-crawl.
      disallow: ["/dashboard/", "/api/", "/reset-password", "/forgot-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
