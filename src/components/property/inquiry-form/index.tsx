"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiSend } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { submitInquiry } from "@/lib/actions/inquiry";
import { notify } from "@/lib/notify";
import { inquirySchema } from "@/lib/validations/inquiry";

const empty = { name: "", email: "", phone: "", message: "", website: "" };
const FIELDS = ["name", "email", "phone", "message"];

export function InquiryForm({ propertyId }: { propertyId?: string }) {
  const t = useTranslations("inquiry");
  const locale = useLocale();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const set =
    (key: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = inquirySchema.safeParse({
      ...values,
      propertyId: propertyId ?? "",
      locale,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (FIELDS.includes(key) && !next[key]) next[key] = t(`errors.${key}`);
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      const res = await submitInquiry(parsed.data);
      if (res.ok) {
        notify.success(t("success"));
        setValues(empty);
      } else {
        notify.error(
          res.error === "rate_limited" ? t("rateLimited") : t("error"),
        );
      }
    } catch {
      notify.error(t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-4">
      <Field label={t("name")} error={errors.name}>
        <Input value={values.name} onChange={set("name")} autoComplete="name" />
      </Field>
      <Field label={t("email")} error={errors.email}>
        <Input
          type="email"
          value={values.email}
          onChange={set("email")}
          autoComplete="email"
        />
      </Field>
      <Field label={t("phone")} error={errors.phone}>
        <Input
          type="tel"
          value={values.phone}
          onChange={set("phone")}
          autoComplete="tel"
        />
      </Field>
      <Field label={t("message")} error={errors.message}>
        <Textarea
          value={values.message}
          onChange={set("message")}
          placeholder={t("messagePlaceholder")}
        />
      </Field>

      {/* Honeypot: invisible to people, tempting to bots */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        <FiSend /> {pending ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
