"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { FiTrash2 } from "react-icons/fi";
import { Select } from "@/components/ui/input";
import {
  INQUIRY_STATUSES,
  type InquiryStatus,
} from "@/config/property-options";
import { useRouter } from "@/i18n/navigation";
import {
  deleteInquiry,
  updateInquiryStatus,
} from "@/lib/actions/inquiry-admin";
import { notify } from "@/lib/notify";

export function InquiryControls({
  id,
  status,
}: {
  id: string;
  status: InquiryStatus;
}) {
  const t = useTranslations("admin.inquiries");
  const router = useRouter();
  const [pending, start] = useTransition();

  function change(next: string) {
    start(async () => {
      const res = await updateInquiryStatus(id, next);
      if (res.ok) {
        notify.success(t("updated"));
        router.refresh();
      } else notify.error(t("error"));
    });
  }

  function remove() {
    if (!window.confirm(t("confirmDelete"))) return;
    start(async () => {
      const res = await deleteInquiry(id);
      if (res.ok) {
        notify.success(t("deleted"));
        router.refresh();
      } else notify.error(t("error"));
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        className="h-9 w-auto"
        aria-label={t("statusLabel")}
      >
        {INQUIRY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </Select>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="rounded-lg p-2 text-red-600 hover:bg-muted disabled:opacity-50"
        aria-label={t("delete")}
        title={t("delete")}
      >
        <FiTrash2 />
      </button>
    </div>
  );
}
