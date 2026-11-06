import { and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db, TENANT_ID } from "../index";
import { properties, type ListingType, type PropertyType } from "../schema";
import { toPropertyView } from "../localize";
import { cache } from "react";

export type PropertyFilters = {
  listingType?: ListingType;
  type?: PropertyType;
  city?: string;
  minPrice?: number; // in the site's default currency
  maxPrice?: number;
  bedrooms?: number;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
};

const withRelations = {
  translations: true,
  agent: true,
  images: { orderBy: (i: any, { asc }: any) => [asc(i.position)] },
} as const;

export async function getProperties(
  locale: string,
  filters: PropertyFilters = {},
) {
  const { page = 1, pageSize = 12, sort = "newest" } = filters;

  const where = and(
    eq(properties.tenantId, TENANT_ID),
    eq(properties.published, true),
    filters.listingType
      ? eq(properties.listingType, filters.listingType)
      : undefined,
    filters.type ? eq(properties.type, filters.type) : undefined,
    filters.city ? ilike(properties.city, filters.city) : undefined,
    filters.minPrice != null
      ? gte(properties.priceBase, String(filters.minPrice))
      : undefined,
    filters.maxPrice != null
      ? lte(properties.priceBase, String(filters.maxPrice))
      : undefined,
    filters.bedrooms != null
      ? gte(properties.bedrooms, filters.bedrooms)
      : undefined,
    filters.featured ? eq(properties.featured, true) : undefined,
  );

  const orderBy =
    sort === "price_asc"
      ? asc(properties.priceBase)
      : sort === "price_desc"
        ? desc(properties.priceBase)
        : desc(properties.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db.query.properties.findMany({
      where,
      with: withRelations,
      orderBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    db.select({ total: count() }).from(properties).where(where),
  ]);

  return {
    items: rows.map((p) => toPropertyView(p, locale)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFeaturedProperties(locale: string, limit = 6) {
  const { items } = await getProperties(locale, {
    featured: true,
    pageSize: limit,
  });
  return items;
}

export type PropertyListItem = Awaited<
  ReturnType<typeof getProperties>
>["items"][number];

export const getPropertyBySlug = cache(async (locale: string, slug: string) => {
  const row = await db.query.properties.findFirst({
    where: and(
      eq(properties.tenantId, TENANT_ID),
      eq(properties.slug, slug),
      eq(properties.published, true),
    ),
    with: withRelations,
  });
  return row ? toPropertyView(row, locale) : null;
});

export async function getCities() {
  const rows = await db
    .selectDistinct({ city: properties.city })
    .from(properties)
    .where(
      and(eq(properties.tenantId, TENANT_ID), eq(properties.published, true)),
    )
    .orderBy(asc(properties.city));
  return rows.map((r) => r.city);
}
