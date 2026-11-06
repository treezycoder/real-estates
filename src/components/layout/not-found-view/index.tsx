import { useTranslations } from "next-intl";
import { FiHome, FiSearch } from "react-icons/fi";
import { buttonStyles } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";

export function NotFoundView() {
  const t = useTranslations("errors.notFound");
  return (
    <Section>
      <Container className="max-w-xl text-center">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("text")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonStyles()}>
            <FiHome /> {t("home")}
          </Link>
          <Link
            href="/properties"
            className={buttonStyles({ variant: "outline" })}
          >
            <FiSearch /> {t("browse")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
