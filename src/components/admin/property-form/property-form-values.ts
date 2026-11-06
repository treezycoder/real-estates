import {
  FEATURE_KEYS,
  type AvailabilityKey,
  type ListingTypeKey,
  type PropertyTypeKey,
  type RentPeriod,
} from "@/config/property-options";
import type { getAdminProperty } from "@/lib/db/queries/admin";

export type Lang = "en" | "fr";
export type ImageItem = { url: string; fileKey: string; alt: string | null };

export type PropertyFormValues = {
  type: PropertyTypeKey;
  listingType: ListingTypeKey;
  availability: AvailabilityKey;
  price: string;
  currency: string;
  rentPeriod: RentPeriod | "";
  bedrooms: string;
  bathrooms: string;
  area: string;
  address: string;
  city: string;
  region: string;
  lat: string;
  lng: string;
  features: string[];
  featured: boolean;
  published: boolean;
  agentId: string;
  tr: Record<Lang, { title: string; description: string }>;
  images: ImageItem[];
};

export function emptyValues(currency: string): PropertyFormValues {
  return {
    type: "house",
    listingType: "sale",
    availability: "available",
    price: "",
    currency,
    rentPeriod: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    city: "",
    region: "",
    lat: "",
    lng: "",
    features: [],
    featured: false,
    published: true,
    agentId: "",
    tr: {
      en: { title: "", description: "" },
      fr: { title: "", description: "" },
    },
    images: [],
  };
}

type AdminProperty = NonNullable<Awaited<ReturnType<typeof getAdminProperty>>>;

export function valuesFromProperty(p: AdminProperty): PropertyFormValues {
  const tr = (l: Lang) => {
    const row = p.translations.find((t) => t.locale === l);
    return { title: row?.title ?? "", description: row?.description ?? "" };
  };
  return {
    type: p.type,
    listingType: p.listingType,
    availability: p.availability,
    price: String(Number(p.price)),
    currency: p.currency,
    rentPeriod: p.rentPeriod ?? "",
    bedrooms: p.bedrooms?.toString() ?? "",
    bathrooms: p.bathrooms?.toString() ?? "",
    area: p.area ? String(Number(p.area)) : "",
    address: p.address ?? "",
    city: p.city,
    region: p.region ?? "",
    lat: p.lat?.toString() ?? "",
    lng: p.lng?.toString() ?? "",
    features: p.features.filter((f) =>
      (FEATURE_KEYS as readonly string[]).includes(f),
    ),
    featured: p.featured,
    published: p.published,
    agentId: p.agentId ?? "",
    tr: { en: tr("en"), fr: tr("fr") },
    images: p.images.map((i) => ({
      url: i.url,
      fileKey: i.fileKey,
      alt: i.alt,
    })),
  };
}
