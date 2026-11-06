import { getTranslations, setRequestLocale } from "next-intl/server";
import { PropertyForm } from "@/components/admin/property-form";
import { emptyValues } from "@/components/admin/property-form/property-form-values";
import { siteConfig } from "@/config/site.config";
import { requireAdmin } from "@/lib/auth/guard";
import { getAgents } from "@/lib/db/queries/admin";

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, agents] = await Promise.all([
    getTranslations("admin.form"),
    getAgents(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
      <PropertyForm
        initial={emptyValues(siteConfig.currency.default)}
        agents={agents}
      />
    </div>
  );
}
