import type { IconType } from "react-icons";
import { useTranslations } from "next-intl";
import { FaBath, FaBed, FaRulerCombined } from "react-icons/fa";
import { cn } from "@/lib/utils";

type Props = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  size?: "sm" | "lg";
  className?: string;
};

export function PropertySpecs({
  bedrooms,
  bathrooms,
  area,
  size = "sm",
  className,
}: Props) {
  const t = useTranslations("properties");

  const items = [
    bedrooms != null && {
      icon: FaBed,
      label: t("bedrooms", { count: bedrooms }),
    },
    bathrooms != null && {
      icon: FaBath,
      label: t("bathrooms", { count: bathrooms }),
    },
    area != null && {
      icon: FaRulerCombined,
      label: t("area", { value: area }),
    },
  ].filter(Boolean) as { icon: IconType; label: string }[];

  if (!items.length) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground",
        size === "lg" ? "text-base" : "text-sm",
        className,
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="text-primary" size={size === "lg" ? 20 : 16} />
          {label}
        </li>
      ))}
    </ul>
  );
}
