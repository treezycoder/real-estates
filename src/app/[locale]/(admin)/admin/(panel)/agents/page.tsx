import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiMail, FiPhone, FiPlus } from "react-icons/fi";
import { AgentRowActions } from "@/components/admin/agent-row-actions";
import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminAgents } from "@/lib/db/queries/admin";

export default async function AdminAgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, agents] = await Promise.all([
    getTranslations("admin.agents"),
    getAdminAgents(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/admin/agents/new" className={buttonStyles()}>
          <FiPlus /> {t("add")}
        </Link>
      </div>

      {agents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-background p-5"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {a.photoUrl ? (
                  <Image
                    src={a.photoUrl}
                    alt={a.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  a.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold">{a.name}</p>
                {a.phone && (
                  <p className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                    <FiPhone className="shrink-0" /> {a.phone}
                  </p>
                )}
                {a.email && (
                  <p className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                    <FiMail className="shrink-0" /> {a.email}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("listings", { count: a.properties.length })}
                </p>
              </div>
              <AgentRowActions id={a.id} name={a.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
