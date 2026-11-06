import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { sectionRegistry } from "@/components/sections/registry";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl, alternatesFor, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale) };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: siteConfig.name,
          url: absoluteUrl(locale),
          image: `${siteUrl()}${siteConfig.logo}`,
          telephone: siteConfig.contact.phone,
          email: siteConfig.contact.email,
          address: siteConfig.contact.address,
        }}
      />
      {siteConfig.homeSections.map((key) => {
        const Section = sectionRegistry[key];
        return Section ? <Section key={key} locale={locale} /> : null;
      })}
    </>
  );
}
