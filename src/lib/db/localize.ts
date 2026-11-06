import { routing } from "@/i18n/routing";

type Base = {
  translations: { locale: string; title: string; description: string }[];
  price: string;
  priceBase: string;
  area: string | null;
};

/**
 * Picks the right translation (falling back to the default locale, then any)
 * and converts Postgres numerics (returned as strings) into numbers.
 */
export function toPropertyView<T extends Base>(p: T, locale: string) {
  const tr =
    p.translations.find((t) => t.locale === locale) ??
    p.translations.find((t) => t.locale === routing.defaultLocale) ??
    p.translations[0];

  return {
    ...p,
    title: tr?.title ?? "",
    description: tr?.description ?? "",
    price: Number(p.price),
    priceBase: Number(p.priceBase),
    area: p.area ? Number(p.area) : null,
  } as Omit<T, "price" | "priceBase" | "area"> & {
    title: string;
    description: string;
    price: number;
    priceBase: number;
    area: number | null;
  };
}
