import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  SORT_OPTIONS,
} from "@/config/property-options";
import type { PropertyFilters } from "@/lib/db/queries/properties";

type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const num = (v: string | string[] | undefined) => {
  const s = one(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const pick = <T extends readonly string[]>(
  list: T,
  v: string | string[] | undefined,
) => {
  const s = one(v);
  return s && list.includes(s) ? (s as T[number]) : undefined;
};

export function parseFilters(sp: SP): PropertyFilters {
  return {
    listingType: pick(LISTING_TYPES, sp.listing),
    type: pick(PROPERTY_TYPES, sp.type),
    city: one(sp.city)?.trim() || undefined,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    bedrooms: num(sp.beds),
    sort: pick(SORT_OPTIONS, sp.sort),
    page: Math.max(1, Math.floor(num(sp.page) ?? 1)),
  };
}
