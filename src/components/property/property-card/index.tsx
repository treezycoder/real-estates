import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiHome, FiMapPin } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import type { PropertyListItem } from "@/lib/db/queries/properties";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "../price-tag";
import { PropertySpecs } from "../property-specs";

export function PropertyCard({ property: p }: { property: PropertyListItem }) {
  const t = useTranslations("properties");
  const tt = useTranslations("types");
  const ta = useTranslations("availability");
  const cover = p.images.find((i) => i.isCover) ?? p.images[0];

  return (
    <Link
      href={`/properties/${p.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? p.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <FiHome size={40} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="primary">
            {p.listingType === "sale" ? t("forSale") : t("forRent")}
          </Badge>
          {p.featured && <Badge variant="accent">{t("featured")}</Badge>}
        </div>
        {p.availability !== "available" && (
          <Badge variant="dark" className="absolute right-3 top-3">
            {ta(p.availability)}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {tt(p.type)}
        </p>
        <PriceTag
          amount={p.price}
          currency={p.currency}
          rentPeriod={p.listingType === "rent" ? p.rentPeriod : null}
          className="text-xl font-bold text-primary"
        />
        <h3 className="line-clamp-2 font-semibold">{p.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FiMapPin className="shrink-0" />
          {p.city}
          {p.region ? `, ${p.region}` : ""}
        </p>
        <PropertySpecs
          bedrooms={p.bedrooms}
          bathrooms={p.bathrooms}
          area={p.area}
          className="mt-auto border-t border-border pt-3"
        />
      </div>
    </Link>
  );
}
