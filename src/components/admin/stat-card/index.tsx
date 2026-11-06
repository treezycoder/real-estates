import type { IconType } from "react-icons";
import { Link } from "@/i18n/navigation";

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: IconType;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border bg-background p-5 transition-shadow hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
        <Icon size={22} />
      </span>
      <span>
        <span className="block text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}
