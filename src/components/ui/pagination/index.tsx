import { useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SP = Record<string, string | string[] | undefined>;

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: SP;
}) {
  const t = useTranslations("pagination");
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val && k !== "page") params.set(k, val);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // 1 … (page-1) page (page+1) … last
  const items: (number | "gap")[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1) items.push(n);
    else if (items[items.length - 1] !== "gap") items.push("gap");
  }

  const box =
    "flex h-10 min-w-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium";

  return (
    <nav
      aria-label={t("label")}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(box, "hover:bg-muted")}>
          <FiChevronLeft /> {t("previous")}
        </Link>
      )}
      {items.map((it, i) =>
        it === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={href(it)}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              box,
              it === page
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {it}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className={cn(box, "hover:bg-muted")}>
          {t("next")} <FiChevronRight />
        </Link>
      )}
    </nav>
  );
}
