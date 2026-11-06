"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSave } from "react-icons/fi";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { createAgent, updateAgent } from "@/lib/actions/agent";
import { notify } from "@/lib/notify";
import { agentSchema } from "@/lib/validations/agent";
import { AvatarUploader } from "../avatar-uploader";
import type { AgentFormValues } from "../agent-form-values";

export function AgentForm({
  agentId,
  initial,
}: {
  agentId?: string;
  initial: AgentFormValues;
}) {
  const t = useTranslations("admin.agentForm");
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const set = <K extends keyof AgentFormValues>(
    key: K,
    value: AgentFormValues[K],
  ) => setV((p) => ({ ...p, [key]: value }));
  const err = (path: string) =>
    errors.has(path) ? t("invalidField") : undefined;
  const bind = (key: "name" | "phone" | "whatsapp" | "email") => ({
    value: v[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, e.target.value),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = agentSchema.safeParse({
      name: v.name,
      phone: v.phone,
      whatsapp: v.whatsapp,
      email: v.email,
      bio: { en: v.bioEn, fr: v.bioFr },
      photo: v.photo,
    });
    if (!parsed.success) {
      setErrors(new Set(parsed.error.issues.map((i) => i.path.join("."))));
      notify.error(t("fixErrors"));
      return;
    }

    setErrors(new Set());
    setPending(true);
    try {
      const res = agentId
        ? await updateAgent(agentId, parsed.data)
        : await createAgent(parsed.data);
      if (res.ok) {
        notify.success(t("saved"));
        router.push("/admin/agents");
        router.refresh();
        return;
      }
      if (res.fields) setErrors(new Set(res.fields));
      notify.error(t(`errors.${res.error}`));
    } catch {
      notify.error(t("errors.server"));
    }
    setPending(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-lg border border-border bg-background p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("photo")}</p>
        <AvatarUploader value={v.photo} onChange={(p) => set("photo", p)} />
      </div>

      <Field label={t("name")} error={err("name")}>
        <Input {...bind("name")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("phone")} error={err("phone")}>
          <Input type="tel" {...bind("phone")} />
        </Field>
        <Field label={t("whatsapp")} error={err("whatsapp")}>
          <Input type="tel" placeholder="+237600000000" {...bind("whatsapp")} />
        </Field>
      </div>

      <Field label={t("email")} error={err("email")}>
        <Input type="email" {...bind("email")} />
      </Field>

      <Field label={t("bioEn")} error={err("bio.en")}>
        <Textarea
          value={v.bioEn}
          onChange={(e) => set("bioEn", e.target.value)}
        />
      </Field>
      <Field label={t("bioFr")} error={err("bio.fr")}>
        <Textarea
          value={v.bioFr}
          onChange={(e) => set("bioFr", e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/admin/agents"
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
