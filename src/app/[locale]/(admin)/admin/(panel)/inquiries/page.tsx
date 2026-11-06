import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { InquiryControls } from "@/components/admin/inquiry-controls";
import {
  INQUIRY_STATUSES,
  type InquiryStatus,
} from "@/config/property-options";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getInquiries, pickTitle } from "@/lib/db/queries/admin";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function InquiriesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const { status } = await searchParams;
  const active = (INQUIRY_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as InquiryStatus)
    : undefined;

  const [t, items] = await Promise.all([
    getTranslations("admin.inquiries"),
    getInquiries(active),
  ]);

  const tab = (isActive: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border hover:bg-muted",
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/inquiries" className={tab(!active)}>
          {t("filterAll")}
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={tab(active === s)}
          >
            {t(`status.${s}`)}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((q) => {
            const digits = q.phone?.replace(/\D/g, "");
            return (
              <li
                key={q.id}
                className="space-y-3 rounded-lg border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{q.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(q.createdAt, locale)}
                    </p>
                  </div>
                  <InquiryControls id={q.id} status={q.status} />
                </div>

                <p className="text-sm text-muted-foreground">
                  {t("about")}{" "}
                  {q.property ? (
                    <Link
                      href={`/properties/${q.property.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {pickTitle(q.property.translations, locale)}
                    </Link>
                  ) : (
                    t("general")
                  )}
                </p>

                <p className="whitespace-pre-line text-sm">{q.message}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href={`mailto:${q.email}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <FiMail /> {q.email}
                  </a>
                  {q.phone && (
                    <a
                      href={`tel:${q.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <FiPhone /> {q.phone}
                    </a>
                  )}
                  {digits && (
                    <a
                      href={`https://wa.me/${digits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <FaWhatsapp /> WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
