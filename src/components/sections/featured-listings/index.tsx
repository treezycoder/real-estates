import { getTranslations } from "next-intl/server";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { getFeaturedProperties } from "@/lib/db/queries/properties";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buttonStyles } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { PropertyGrid } from "@/components/property/property-grid";

export async function FeaturedListings({ locale }: { locale: string }) {
  const [t, items] = await Promise.all([
    getTranslations("featured"),
    getFeaturedProperties(locale, 6),
  ]);
  if (!items.length) return null;

  return (
    <Section>
      <Container>
        <FadeIn className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </FadeIn>

        <PropertyGrid items={items} />

        <div className="mt-10 text-center">
          <Link
            href="/properties"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            {t("viewAll")} <FiArrowRight />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
