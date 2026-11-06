import { useTranslations } from "next-intl";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Section } from "@/components/ui/section";
import { buttonStyles } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <Section className="bg-muted">
      <Container className="max-w-4xl text-center">
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {t("title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-6 text-lg text-muted-foreground">{t("subtitle")}</p>
        </FadeIn>
        <FadeIn
          delay={0.2}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link href="/properties" className={buttonStyles({ size: "lg" })}>
            {t("cta")} <FiArrowRight />
          </Link>
          <Link
            href="/contact"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            {t("contact")}
          </Link>
        </FadeIn>
      </Container>
    </Section>
  );
}
