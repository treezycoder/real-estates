import { Suspense } from "react";
import type { Metadata } from "next";
import { FiSearch } from "react-icons/fi";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site.config";
import { getCities, getProperties } from "@/lib/db/queries/properties";
import { parseFilters } from "@/lib/validations/filters";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Pagination } from "@/components/ui/pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { FilterBar } from "@/components/property/filter-bar";
import { PropertyGrid } from "@/components/property/property-grid";
import { alternatesFor } from "@/lib/seo";

type SP = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
};

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "properties" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: alternatesFor(locale, "/properties"),
  };
}

export default async function PropertiesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [t, result, cities] = await Promise.all([
    getTranslations("properties"),
    getProperties(locale, parseFilters(sp)),
    getCities(),
  ]);

  return (
    <>
      <Section className="bg-muted py-12 md:py-16">
        <Container>
          <FadeIn>
            <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      <Section className="py-10 md:py-12">
        <Container className="space-y-8">
          <Suspense fallback={null}>
            <FilterBar cities={cities} currency={siteConfig.currency.default} />
          </Suspense>

          <p className="text-sm text-muted-foreground">
            {t("results", { count: result.total })}
          </p>

          {result.items.length > 0 ? (
            <>
              <PropertyGrid key={JSON.stringify(sp)} items={result.items} />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                basePath="/properties"
                searchParams={sp}
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <FiSearch size={32} className="mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("emptyHint")}
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
