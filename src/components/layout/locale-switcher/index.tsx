"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "en" ? "fr" : "en";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
      aria-label={`Switch language to ${next.toUpperCase()}`}
    >
      {next.toUpperCase()}
    </button>
  );
}
