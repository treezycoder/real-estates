import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AgentForm } from "@/components/admin/agent-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminAgent } from "@/lib/db/queries/admin";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [t, agent] = await Promise.all([
    getTranslations("admin.agentForm"),
    getAdminAgent(id),
  ]);
  if (!agent) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
      <AgentForm
        agentId={agent.id}
        initial={{
          name: agent.name,
          phone: agent.phone ?? "",
          whatsapp: agent.whatsapp ?? "",
          email: agent.email ?? "",
          bioEn: agent.bio.en ?? "",
          bioFr: agent.bio.fr ?? "",
          photo:
            agent.photoUrl && agent.photoKey
              ? { url: agent.photoUrl, fileKey: agent.photoKey }
              : null,
        }}
      />
    </div>
  );
}
