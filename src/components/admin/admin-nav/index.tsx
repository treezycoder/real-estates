"use client";

import { useTranslations } from "next-intl";
import {
  FiExternalLink,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { siteConfig } from "@/config/site.config";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import Image from "next/image";

const items = [
  { key: "dashboard", href: "/admin", icon: FiGrid, exact: true },
  { key: "properties", href: "/admin/properties", icon: FiHome, exact: false },
  { key: "inquiries", href: "/admin/inquiries", icon: FiMail, exact: false },
  { key: "agents", href: "/admin/agents", icon: FiUsers, exact: false },
] as const;

export function AdminNav({
  email,
  newInquiries,
}: {
  email: string;
  newInquiries: number;
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/admin/login") },
    });
  }

  return (
    <aside className="border-b border-border bg-background lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between p-4">
        <p className="font-bold flex items-center gap-2 text-lg ">
          {" "}
          <Image
            src="/logo.svg"
            alt={`${siteConfig.name} logo`}
            width={40}
            height={40}
            priority
          />
          {siteConfig.name}
        </p>
        <div className="lg:hidden">
          <LocaleSwitcher />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
        {items.map(({ key, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <Icon size={18} />
              {t(key)}
              {key === "inquiries" && newInquiries > 0 && (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-foreground">
                  {newInquiries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-4 lg:block lg:space-y-3">
        <p className="w-full truncate text-xs text-muted-foreground">{email}</p>
        <div className="hidden lg:block">
          <LocaleSwitcher />
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm hover:text-primary"
        >
          <FiExternalLink /> {t("viewSite")}
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 text-sm hover:text-primary"
        >
          <FiLogOut /> {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
