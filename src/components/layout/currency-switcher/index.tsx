"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { useTranslations } from "next-intl";

export function CurrencySwitcher() {
  const t = useTranslations("currency");
  const { currency, setCurrency, supported } = useCurrency();
  if (supported.length < 2) return null;

  return (
    <select
      aria-label={t("label")}
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="h-9 rounded-lg border border-border bg-background px-2 text-sm font-medium"
    >
      {supported.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
