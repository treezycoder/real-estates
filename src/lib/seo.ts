import { routing } from "@/i18n/routing";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function absoluteUrl(locale: string, path = "") {
  return `${siteUrl()}/${locale}${path === "/" ? "" : path}`;
}

// canonical + hreflang for a page. Filter query strings are intentionally not part of
// the canonical, so /properties?city=Douala is not indexed as a separate page.
export function alternatesFor(locale: string, path = "") {
  return {
    canonical: absoluteUrl(locale, path),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, absoluteUrl(l, path)]),
      ),
      "x-default": absoluteUrl(routing.defaultLocale, path),
    },
  };
}
