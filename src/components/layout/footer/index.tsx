import { useTranslations } from "next-intl";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site.config";
import Container from "@/components/ui/container";

export function Footer() {
  const t = useTranslations("footer");
  const n = useTranslations("nav");
  const { contact } = siteConfig;

  return (
    <footer className="border-t border-border bg-muted">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{siteConfig.name}</p>
          <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        <div>
          <p className="font-semibold">{t("links")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="hover:text-primary">
                  {n(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold">{t("contact")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <FiMail /> {contact.email}
            </li>
            <li className="flex items-center gap-2">
              <FiPhone /> {contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin /> {contact.address}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
      </div>
    </footer>
  );
}
