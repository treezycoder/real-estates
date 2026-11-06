"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  AVAILABILITY,
  FEATURE_KEYS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_PERIODS,
} from "@/config/property-options";
import { siteConfig } from "@/config/site.config";
import { Link, useRouter } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button";
import { createProperty, updateProperty } from "@/lib/actions/property";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { propertySchema } from "@/lib/validations/property";
import { ImageUploader } from "../image-uploader";
import { LocationPicker } from "../location-picker";
import type { Lang, PropertyFormValues } from "./property-form-values";

type TextKey =
  | "price"
  | "bedrooms"
  | "bathrooms"
  | "area"
  | "address"
  | "city"
  | "region"
  | "lat"
  | "lng";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-lg border border-border bg-background p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const num = (s: string) => (s.trim() === "" ? null : Number(s));

function toInput(v: PropertyFormValues) {
  return {
    type: v.type,
    listingType: v.listingType,
    availability: v.availability,
    price: Number(v.price),
    currency: v.currency,
    rentPeriod: v.listingType === "rent" ? v.rentPeriod || null : null,
    bedrooms: num(v.bedrooms),
    bathrooms: num(v.bathrooms),
    area: num(v.area),
    address: v.address,
    city: v.city,
    region: v.region,
    lat: num(v.lat),
    lng: num(v.lng),
    features: v.features,
    featured: v.featured,
    published: v.published,
    agentId: v.agentId || null,
    translations: { en: v.tr.en, fr: v.tr.fr },
    images: v.images,
  };
}

export function PropertyForm({
  propertyId,
  initial,
  agents,
}: {
  propertyId?: string;
  initial: PropertyFormValues;
  agents: { id: string; name: string }[];
}) {
  const t = useTranslations("admin.form");
  const tt = useTranslations("types");
  const ta = useTranslations("availability");
  const tp = useTranslations("properties");
  const tf = useTranslations("features");
  const router = useRouter();

  const [v, setV] = useState(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const set = <K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  const setTr = (l: Lang, field: "title" | "description", value: string) =>
    setV((prev) => ({
      ...prev,
      tr: { ...prev.tr, [l]: { ...prev.tr[l], [field]: value } },
    }));

  const bind = (key: TextKey) => ({
    value: v[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, e.target.value),
  });

  const err = (path: string) =>
    errors.has(path) ? t("invalidField") : undefined;
  const langHasError = (l: Lang) =>
    [...errors].some((p) => p.startsWith(`translations.${l}`));

  const toggleFeature = (k: string) =>
    set(
      "features",
      v.features.includes(k)
        ? v.features.filter((x) => x !== k)
        : [...v.features, k],
    );

  const lat =
    v.lat.trim() !== "" && Number.isFinite(Number(v.lat))
      ? Number(v.lat)
      : null;
  const lng =
    v.lng.trim() !== "" && Number.isFinite(Number(v.lng))
      ? Number(v.lng)
      : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = propertySchema.safeParse(toInput(v));
    if (!parsed.success) {
      setErrors(new Set(parsed.error.issues.map((i) => i.path.join("."))));
      notify.error(t("fixErrors"));
      return;
    }

    setErrors(new Set());
    setPending(true);
    try {
      const res = propertyId
        ? await updateProperty(propertyId, parsed.data)
        : await createProperty(parsed.data);

      if (res.ok) {
        notify.success(t("saved"));
        router.push("/admin/properties");
        router.refresh();
        return; // stay "pending" while navigating
      }
      if (res.fields) setErrors(new Set(res.fields));
      notify.error(t(`errors.${res.error}`));
    } catch {
      notify.error(t("errors.server"));
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card title={t("sections.content")}>
        <div role="tablist" className="flex gap-2">
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                lang === l
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted",
                langHasError(l) && lang !== l && "border-red-500 text-red-600",
              )}
            >
              {t(`lang.${l}`)}
            </button>
          ))}
        </div>
        <Field label={t("title")} error={err(`translations.${lang}.title`)}>
          <Input
            value={v.tr[lang].title}
            onChange={(e) => setTr(lang, "title", e.target.value)}
          />
        </Field>
        <Field
          label={t("description")}
          error={err(`translations.${lang}.description`)}
        >
          <Textarea
            className="min-h-40"
            value={v.tr[lang].description}
            onChange={(e) => setTr(lang, "description", e.target.value)}
          />
        </Field>
      </Card>

      <Card title={t("sections.details")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("type")}>
            <Select
              value={v.type}
              onChange={(e) => set("type", e.target.value as typeof v.type)}
            >
              {PROPERTY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {tt(p)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("listing")}>
            <Select
              value={v.listingType}
              onChange={(e) =>
                set("listingType", e.target.value as typeof v.listingType)
              }
            >
              {LISTING_TYPES.map((l) => (
                <option key={l} value={l}>
                  {l === "sale" ? tp("forSale") : tp("forRent")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("availability")}>
            <Select
              value={v.availability}
              onChange={(e) =>
                set("availability", e.target.value as typeof v.availability)
              }
            >
              {AVAILABILITY.map((a) => (
                <option key={a} value={a}>
                  {ta(a)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("price")} error={err("price")}>
            <Input
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              {...bind("price")}
            />
          </Field>
          <Field label={t("currency")}>
            <Select
              value={v.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {siteConfig.currency.supported.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          {v.listingType === "rent" && (
            <Field label={t("rentPeriod")} error={err("rentPeriod")}>
              <Select
                value={v.rentPeriod}
                onChange={(e) =>
                  set("rentPeriod", e.target.value as typeof v.rentPeriod)
                }
              >
                <option value="">—</option>
                {RENT_PERIODS.map((r) => (
                  <option key={r} value={r}>
                    {tp(`period.${r}`)}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("bedrooms")} error={err("bedrooms")}>
            <Input type="number" min={0} {...bind("bedrooms")} />
          </Field>
          <Field label={t("bathrooms")} error={err("bathrooms")}>
            <Input type="number" min={0} {...bind("bathrooms")} />
          </Field>
          <Field label={t("area")} error={err("area")}>
            <Input type="number" min={0} step="any" {...bind("area")} />
          </Field>
        </div>
      </Card>

      <Card title={t("sections.location")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("city")} error={err("city")}>
            <Input {...bind("city")} />
          </Field>
          <Field label={t("region")}>
            <Input {...bind("region")} />
          </Field>
          <Field label={t("address")}>
            <Input {...bind("address")} />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("mapHint")}</p>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(la, ln) =>
              setV((p) => ({ ...p, lat: la.toFixed(6), lng: ln.toFixed(6) }))
            }
          />
        </div>

        <div className="grid items-end gap-4 sm:grid-cols-3">
          <Field label={t("latitude")} error={err("lat")}>
            <Input type="number" step="any" {...bind("lat")} />
          </Field>
          <Field label={t("longitude")} error={err("lng")}>
            <Input type="number" step="any" {...bind("lng")} />
          </Field>
          <Button
            type="button"
            variant="outline"
            onClick={() => setV((p) => ({ ...p, lat: "", lng: "" }))}
          >
            {t("clearPin")}
          </Button>
        </div>
      </Card>

      <Card title={t("sections.features")}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={v.features.includes(k)}
                onChange={() => toggleFeature(k)}
              />
              {tf(k)}
            </label>
          ))}
        </div>
      </Card>

      <Card title={t("sections.photos")}>
        <ImageUploader
          value={v.images}
          onChange={(images) => set("images", images)}
        />
        {err("images") && (
          <p className="text-xs text-red-600">{err("images")}</p>
        )}
      </Card>

      <Card title={t("sections.settings")}>
        <Field label={t("agent")} className="max-w-sm">
          <Select
            value={v.agentId}
            onChange={(e) => set("agentId", e.target.value)}
          >
            <option value="">{t("noAgent")}</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={v.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            {t("published")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={v.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            {t("featured")}
          </label>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-border bg-background/90 p-4 backdrop-blur sm:-mx-6 lg:-mx-8">
        <Link
          href="/admin/properties"
          className={buttonStyles({ variant: "outline" })}
        >
          {t("cancel")}
        </Link>
        <Button type="submit" disabled={pending}>
          <FiSave /> {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
