"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { siteConfig } from "@/config/site.config";
import { getAdminSession } from "@/lib/auth/guard";
import { db, TENANT_ID } from "@/lib/db";
import { getRates } from "@/lib/db/queries/rates";
import {
  properties,
  propertyImages,
  propertyTranslations,
} from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { propertySchema, type PropertyInput } from "@/lib/validations/property";
import { removeFiles } from "@/lib/uploadthing-server";

export type SaveResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "unauthorized" | "invalid" | "rate" | "server";
      fields?: string[];
    };
export type SimpleResult = { ok: true } | { ok: false; error: string };

const isUuid = (s: string) => z.string().uuid().safeParse(s).success;
const refresh = () => revalidatePath("/", "layout");

async function uniqueSlug(title: string) {
  const root = slugify(title) || "property";
  let candidate = root;
  for (let i = 0; i < 5; i++) {
    const clash = await db
      .select({ id: properties.id })
      .from(properties)
      .where(
        and(eq(properties.tenantId, TENANT_ID), eq(properties.slug, candidate)),
      )
      .limit(1);
    if (!clash.length) return candidate;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// rates[code] = units of the base currency per 1 unit of `code`
async function toPriceBase(price: number, currency: string) {
  if (currency === siteConfig.currency.default) return price;
  const rate = (await getRates())[currency];
  return rate ? price * rate : null;
}

function propertyValues(d: PropertyInput, priceBase: number) {
  return {
    type: d.type,
    listingType: d.listingType,
    availability: d.availability,
    price: String(d.price),
    currency: d.currency,
    priceBase: String(priceBase),
    rentPeriod: d.listingType === "rent" ? d.rentPeriod : null,
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    area: d.area != null ? String(d.area) : null,
    address: d.address || null,
    city: d.city,
    region: d.region || null,
    lat: d.lat,
    lng: d.lng,
    features: d.features,
    featured: d.featured,
    published: d.published,
    agentId: d.agentId,
  };
}

const translationRows = (id: string, d: PropertyInput) =>
  (["en", "fr"] as const).map((locale) => ({
    propertyId: id,
    locale,
    ...d.translations[locale],
  }));

const imageRows = (id: string, d: PropertyInput) =>
  d.images.map((img, i) => ({
    propertyId: id,
    url: img.url,
    fileKey: img.fileKey,
    alt: img.alt,
    position: i,
    isCover: i === 0,
  }));

export async function createProperty(input: unknown): Promise<SaveResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };

  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: parsed.error.issues.map((i) => i.path.join(".")),
    };
  }
  const d = parsed.data;

  const priceBase = await toPriceBase(d.price, d.currency);
  if (priceBase == null) return { ok: false, error: "rate" };

  try {
    const id = crypto.randomUUID();
    const slug = await uniqueSlug(d.translations.en.title);

    await db.batch([
      db.insert(properties).values({
        id,
        tenantId: TENANT_ID,
        slug,
        ...propertyValues(d, priceBase),
      }),
      db.insert(propertyTranslations).values(translationRows(id, d)),
      ...(d.images.length
        ? [db.insert(propertyImages).values(imageRows(id, d))]
        : []),
    ]);

    refresh();
    return { ok: true, id };
  } catch (e) {
    console.error("createProperty failed", e);
    return { ok: false, error: "server" };
  }
}

export async function updateProperty(
  id: string,
  input: unknown,
): Promise<SaveResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!isUuid(id)) return { ok: false, error: "invalid" };

  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: parsed.error.issues.map((i) => i.path.join(".")),
    };
  }
  const d = parsed.data;

  const priceBase = await toPriceBase(d.price, d.currency);
  if (priceBase == null) return { ok: false, error: "rate" };

  try {
    const existing = await db.query.properties.findFirst({
      where: and(eq(properties.id, id), eq(properties.tenantId, TENANT_ID)),
      with: { images: true },
    });
    if (!existing) return { ok: false, error: "invalid" };

    // Slug is intentionally never changed after creation, so public links keep working
    await db.batch([
      db
        .update(properties)
        .set(propertyValues(d, priceBase))
        .where(and(eq(properties.id, id), eq(properties.tenantId, TENANT_ID))),
      db
        .delete(propertyTranslations)
        .where(eq(propertyTranslations.propertyId, id)),
      db.insert(propertyTranslations).values(translationRows(id, d)),
      db.delete(propertyImages).where(eq(propertyImages.propertyId, id)),
      ...(d.images.length
        ? [db.insert(propertyImages).values(imageRows(id, d))]
        : []),
    ]);

    const kept = new Set(d.images.map((i) => i.fileKey));
    await removeFiles(
      existing.images.map((i) => i.fileKey).filter((k) => !kept.has(k)),
    );

    refresh();
    return { ok: true, id };
  } catch (e) {
    console.error("updateProperty failed", e);
    return { ok: false, error: "server" };
  }
}

export async function deleteProperty(id: string): Promise<SimpleResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!isUuid(id)) return { ok: false, error: "invalid" };

  try {
    const existing = await db.query.properties.findFirst({
      where: and(eq(properties.id, id), eq(properties.tenantId, TENANT_ID)),
      with: { images: true },
    });
    if (!existing) return { ok: false, error: "invalid" };

    // translations + images cascade; inquiries keep their row with property set to null
    await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.tenantId, TENANT_ID)));
    await removeFiles(existing.images.map((i) => i.fileKey));

    refresh();
    return { ok: true };
  } catch (e) {
    console.error("deleteProperty failed", e);
    return { ok: false, error: "server" };
  }
}

export async function togglePropertyFlag(
  id: string,
  field: "published" | "featured",
  value: boolean,
): Promise<SimpleResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!isUuid(id) || (field !== "published" && field !== "featured")) {
    return { ok: false, error: "invalid" };
  }

  try {
    await db
      .update(properties)
      .set(field === "published" ? { published: value } : { featured: value })
      .where(and(eq(properties.id, id), eq(properties.tenantId, TENANT_ID)));
    refresh();
    return { ok: true };
  } catch (e) {
    console.error("togglePropertyFlag failed", e);
    return { ok: false, error: "server" };
  }
}
