import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PropertyForm } from "@/components/admin/property-form";
import { valuesFromProperty } from "@/components/admin/property-form/property-form-values";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminProperty, getAgents } from "@/lib/db/queries/admin";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, property, agents] = await Promise.all([
    getTranslations("admin.form"),
    getAdminProperty(id),
    getAgents(),
  ]);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
      <PropertyForm
        propertyId={property.id}
        initial={valuesFromProperty(property)}
        agents={agents}
      />
    </div>
  );
}
