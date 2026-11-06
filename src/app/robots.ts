import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...routing.locales.map((l) => `/${l}/admin`)],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
