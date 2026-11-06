"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiSearch, FiX } from "react-icons/fi";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  SORT_OPTIONS,
} from "@/config/property-options";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const KEYS = ["listing", "type", "city", "min", "max", "beds", "sort"] as const;

export function FilterBar({
  cities,
  currency,
}: {
  cities: string[];
  currency: string;
}) {
  const t = useTranslations("filters");
  const tt = useTranslations("types");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const hasFilters = KEYS.some((k) => sp.get(k));

  function go(qs: string) {
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const key of KEYS) {
      const value = String(fd.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    go(params.toString()); // page param is dropped on purpose: filters reset to page 1
  }

  return (
    <form
      key={sp.toString()} // remounts when the URL changes so defaults (and Reset) stay in sync
      onSubmit={onSubmit}
      className={cn(
        "grid gap-4 rounded-lg border border-border bg-background p-4 transition-opacity sm:grid-cols-2 lg:grid-cols-4",
        pending && "opacity-70",
      )}
    >
      <Field label={t("listing")}>
        <Select name="listing" defaultValue={sp.get("listing") ?? ""}>
          <option value="">{t("all")}</option>
          {LISTING_TYPES.map((l) => (
            <option key={l} value={l}>
              {t(l)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("type")}>
        <Select name="type" defaultValue={sp.get("type") ?? ""}>
          <option value="">{t("anyType")}</option>
          {PROPERTY_TYPES.map((p) => (
            <option key={p} value={p}>
              {tt(p)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("city")}>
        <Select name="city" defaultValue={sp.get("city") ?? ""}>
          <option value="">{t("anyCity")}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("bedrooms")}>
        <Select name="beds" defaultValue={sp.get("beds") ?? ""}>
          <option value="">{t("anyBeds")}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
      </Field>

      <Field label={`${t("minPrice")} (${currency})`}>
        <Input
          name="min"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={sp.get("min") ?? ""}
        />
      </Field>

      <Field label={`${t("maxPrice")} (${currency})`}>
        <Input
          name="max"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={sp.get("max") ?? ""}
        />
      </Field>

      <Field label={t("sortBy")}>
        <Select name="sort" defaultValue={sp.get("sort") ?? "newest"}>
          {SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`sort.${s}`)}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          <FiSearch /> {t("search")}
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={() => go("")}
            aria-label={t("reset")}
          >
            <FiX />
          </Button>
        )}
      </div>
    </form>
  );
}
