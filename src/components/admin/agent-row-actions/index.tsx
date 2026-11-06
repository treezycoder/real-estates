"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteAgent } from "@/lib/actions/agent";
import { notify } from "@/lib/notify";

const btn =
  "rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-50";

export function AgentRowActions({ id, name }: { id: string; name: string }) {
  const t = useTranslations("admin.agents");
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    if (!window.confirm(t("confirmDelete", { name }))) return;
    start(async () => {
      const res = await deleteAgent(id);
      if (res.ok) {
        notify.success(t("deleted"));
        router.refresh();
      } else notify.error(t("error"));
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/agents/${id}/edit`}
        className={btn}
        title={t("edit")}
        aria-label={t("edit")}
      >
        <FiEdit2 />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className={`${btn} text-red-600`}
        title={t("delete")}
        aria-label={t("delete")}
      >
        <FiTrash2 />
      </button>
    </div>
  );
}
