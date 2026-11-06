import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { routing } from "@/i18n/routing";
import { db, TENANT_ID } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATIC_PATHS = ["", "/properties", "/about", "/contact"];

function entry(
  path: string,
  lastModified?: Date,
  priority = 0.7,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(l, path)]),
  );
  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    lastModified,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = STATIC_PATHS.flatMap((p) =>
    entry(p, undefined, p === "" ? 1 : 0.6),
  );

  try {
    const rows = await db
      .select({ slug: properties.slug, updatedAt: properties.updatedAt })
      .from(properties)
      .where(
        and(eq(properties.tenantId, TENANT_ID), eq(properties.published, true)),
      );

    return [
      ...pages,
      ...rows.flatMap((r) => entry(`/properties/${r.slug}`, r.updatedAt, 0.8)),
    ];
  } catch (e) {
    console.error(
      "sitemap: database unavailable, returning static pages only",
      e,
    );
    return pages;
  }
}
