import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiHome, FiMail, FiPlus, FiStar, FiEye } from "react-icons/fi";
import { StatCard } from "@/components/admin/stat-card";
import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminStats, getInquiries, pickTitle } from "@/lib/db/queries/admin";
import { formatDateTime } from "@/lib/format";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, ti, stats, recent] = await Promise.all([
    getTranslations("admin.dashboard"),
    getTranslations("admin.inquiries"),
    getAdminStats(),
    getInquiries(undefined, 5),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/admin/properties/new" className={buttonStyles()}>
          <FiPlus /> {t("add")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiHome}
          label={t("total")}
          value={stats.total}
          href="/admin/properties"
        />
        <StatCard
          icon={FiEye}
          label={t("published")}
          value={stats.published}
          href="/admin/properties"
        />
        <StatCard
          icon={FiStar}
          label={t("featured")}
          value={stats.featured}
          href="/admin/properties"
        />
        <StatCard
          icon={FiMail}
          label={t("newInquiries")}
          value={stats.newInquiries}
          href="/admin/inquiries?status=new"
        />
      </div>

      <section className="rounded-lg border border-border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("recent")}</h2>
          <Link
            href="/admin/inquiries"
            className="text-sm text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("none")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((q) => (
              <li
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{q.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {q.property
                      ? pickTitle(q.property.translations, locale)
                      : ti("general")}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{ti(`status.${q.status}`)}</p>
                  <p>{formatDateTime(q.createdAt, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
