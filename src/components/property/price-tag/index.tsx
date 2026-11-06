"use client";

import { useTranslations } from "next-intl";
import type { RentPeriod } from "@/config/property-options";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";

export function PriceTag({
  amount,
  currency,
  rentPeriod,
  className,
}: {
  amount: number;
  currency: string;
  rentPeriod?: RentPeriod | null;
  className?: string;
}) {
  const t = useTranslations("properties.period");
  const { format } = useCurrency();
  const { text, original, converted } = format(amount, currency);

  return (
    <span
      className={cn("inline-flex items-baseline gap-1", className)}
      title={converted ? original : undefined}
    >
      <span>
        {converted ? "≈ " : ""}
        {text}
      </span>
      {rentPeriod && (
        <span className="text-sm font-normal text-muted-foreground">
          / {t(rentPeriod)}
        </span>
      )}
    </span>
  );
}
