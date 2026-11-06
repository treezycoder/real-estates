import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiHome, FiPlus } from "react-icons/fi";
import { PropertyRowActions } from "@/components/admin/property-row-actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminProperties, pickTitle } from "@/lib/db/queries/admin";
import { formatPrice } from "@/lib/format";

export default async function AdminPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, tt, items] = await Promise.all([
    getTranslations("admin.properties"),
    getTranslations("types"),
    getAdminProperties(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/admin/properties/new" className={buttonStyles()}>
          <FiPlus /> {t("add")}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("property")}</th>
                <th className="px-4 py-3">{t("price")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => {
                const title = pickTitle(p.translations, locale);
                const cover = p.images.find((i) => i.isCover) ?? p.images[0];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          {cover ? (
                            <Image
                              src={cover.url}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <FiHome className="absolute inset-0 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {tt(p.type)} · {p.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatPrice(Number(p.price), p.currency, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={p.published ? "primary" : "muted"}>
                          {p.published ? t("published") : t("draft")}
                        </Badge>
                        {p.featured && (
                          <Badge variant="accent">{t("featured")}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PropertyRowActions
                        id={p.id}
                        title={title}
                        published={p.published}
                        featured={p.featured}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
