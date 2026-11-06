import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowLeft, FiCheck, FiMapPin, FiPhone } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site.config";
import { getPropertyBySlug } from "@/lib/db/queries/properties";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Gallery } from "@/components/property/gallery";
import { InquiryForm } from "@/components/property/inquiry-form";
import { PriceTag } from "@/components/property/price-tag";
import { PropertyMap } from "@/components/property/property-map";
import { PropertySpecs } from "@/components/property/property-specs";
import { absoluteUrl, alternatesFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getPropertyBySlug(locale, slug);
  if (!p) return {};
  const cover = p.images.find((i) => i.isCover) ?? p.images[0];
  const description = p.description.slice(0, 160);
  return {
    title: p.title,
    description,
    openGraph: {
      title: p.title,
      description,
      images: cover ? [{ url: cover.url }] : [],
    },

    alternates: alternatesFor(locale, `/properties/${slug}`),
  };
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const p = await getPropertyBySlug(locale, slug);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: absoluteUrl(locale, `/properties/${p.slug}`),
    datePosted: p.createdAt.toISOString(),
    image: p.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      availability:
        p.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    contentLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: p.address ?? undefined,
        addressLocality: p.city,
        addressRegion: p.region ?? undefined,
        addressCountry: p.country,
      },
      ...(p.lat != null && p.lng != null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: p.lat,
              longitude: p.lng,
            },
          }
        : {}),
    },
  };

  const [t, tt, ta, tf] = await Promise.all([
    getTranslations("properties"),
    getTranslations("types"),
    getTranslations("availability"),
    getTranslations("features"),
  ]);

  const agent = p.agent;
  const whatsapp = (agent?.whatsapp ?? siteConfig.contact.whatsapp).replace(
    /\D/g,
    "",
  );
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage", { title: p.title }),
  )}`;

  return (
    <>
      <JsonLd data={jsonLd} />
      <Section className="py-8 md:py-12">
        <Container>
          <Link
            href="/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <FiArrowLeft /> {t("back")}
          </Link>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Left column */}
            <div className="min-w-0 space-y-8 lg:col-span-2">
              <Gallery
                images={p.images.map((i) => ({ url: i.url, alt: i.alt }))}
                title={p.title}
              />

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">
                    {p.listingType === "sale" ? t("forSale") : t("forRent")}
                  </Badge>
                  <Badge>{tt(p.type)}</Badge>
                  {p.availability !== "available" && (
                    <Badge variant="dark">{ta(p.availability)}</Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold md:text-4xl">{p.title}</h1>

                <p className="flex items-center gap-2 text-muted-foreground">
                  <FiMapPin />
                  {[p.address, p.city, p.region].filter(Boolean).join(", ")}
                </p>

                <PriceTag
                  amount={p.price}
                  currency={p.currency}
                  rentPeriod={p.listingType === "rent" ? p.rentPeriod : null}
                  className="text-3xl font-bold text-primary"
                />

                <PropertySpecs
                  bedrooms={p.bedrooms}
                  bathrooms={p.bathrooms}
                  area={p.area}
                  size="lg"
                  className="border-y border-border py-4"
                />
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold">
                  {t("description")}
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>

              {p.features.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xl font-semibold">
                    {t("features")}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {p.features.map((key) => (
                      <li key={key} className="flex items-center gap-2">
                        <FiCheck className="text-primary" />
                        {tf.has(key) ? tf(key) : key}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {p.lat != null && p.lng != null && (
                <div>
                  <h2 className="mb-3 text-xl font-semibold">
                    {t("location")}
                  </h2>
                  <PropertyMap lat={p.lat} lng={p.lng} />
                </div>
              )}
            </div>

            {/* Right column */}
            <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
              {agent && (
                <div className="rounded-lg border border-border p-5">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    {t("agent")}
                  </p>
                  <div className="flex items-center gap-3">
                    {agent.photoUrl ? (
                      <Image
                        src={agent.photoUrl}
                        alt={agent.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{agent.name}</p>
                      {agent.phone && (
                        <p className="text-sm text-muted-foreground">
                          {agent.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonStyles({
                        className: "bg-green-600 text-white hover:bg-green-700",
                      })}
                    >
                      <FaWhatsapp size={18} /> {t("whatsapp")}
                    </a>
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone.replace(/\s/g, "")}`}
                        className={buttonStyles({ variant: "outline" })}
                      >
                        <FiPhone /> {t("call")}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  {t("contactAbout")}
                </h2>
                <InquiryForm propertyId={p.id} />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
