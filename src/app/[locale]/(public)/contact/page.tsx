import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { siteConfig } from "@/config/site.config";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import { InquiryForm } from "@/components/property/inquiry-form";
import { alternatesFor } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: alternatesFor(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const c = siteConfig.contact;

  const rows = [
    {
      icon: FiMail,
      label: t("email"),
      value: c.email,
      href: `mailto:${c.email}`,
    },
    {
      icon: FiPhone,
      label: t("phone"),
      value: c.phone,
      href: `tel:${c.phone.replace(/\s/g, "")}`,
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      value: c.phone,
      href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`,
    },
    { icon: FiMapPin, label: t("address"), value: c.address },
  ];

  return (
    <Section>
      <Container>
        <FadeIn className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </FadeIn>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t("details")}</h2>
            <ul className="space-y-5">
              {rows.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="font-medium hover:text-primary">
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-xl font-semibold">{t("formTitle")}</h2>
            <InquiryForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}

// small helper so the form card reuses the inquiry title key
// function window_title(t: Awaited<ReturnType<typeof getTranslations>>) {
//   return t("formTitle");
// }
