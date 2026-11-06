import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import { alternatesFor } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), alternates: alternatesFor(locale, "/about") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <Section>
      <Container className="max-w-3xl">
        <FadeIn>
          <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}
