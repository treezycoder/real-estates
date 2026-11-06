"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { FiEdit2, FiEye, FiEyeOff, FiStar, FiTrash2 } from "react-icons/fi";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteProperty, togglePropertyFlag } from "@/lib/actions/property";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const btn =
  "rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-50";

export function PropertyRowActions({
  id,
  title,
  published,
  featured,
}: {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
}) {
  const t = useTranslations("admin.properties");
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle(field: "published" | "featured", value: boolean) {
    start(async () => {
      const res = await togglePropertyFlag(id, field, value);
      if (res.ok) {
        notify.success(t("updated"));
        router.refresh();
      } else notify.error(t("error"));
    });
  }

  function remove() {
    if (!window.confirm(t("confirmDelete", { title }))) return;
    start(async () => {
      const res = await deleteProperty(id);
      if (res.ok) {
        notify.success(t("deleted"));
        router.refresh();
      } else notify.error(t("error"));
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("published", !published)}
        className={btn}
        title={published ? t("unpublish") : t("publish")}
        aria-label={published ? t("unpublish") : t("publish")}
      >
        {published ? <FiEye /> : <FiEyeOff />}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("featured", !featured)}
        className={cn(btn, featured && "text-accent")}
        title={featured ? t("unfeature") : t("feature")}
        aria-label={featured ? t("unfeature") : t("feature")}
      >
        <FiStar className={featured ? "fill-current" : ""} />
      </button>
      <Link
        href={`/admin/properties/${id}/edit`}
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
        className={cn(btn, "text-red-600")}
        title={t("delete")}
        aria-label={t("delete")}
      >
        <FiTrash2 />
      </button>
    </div>
  );
}
