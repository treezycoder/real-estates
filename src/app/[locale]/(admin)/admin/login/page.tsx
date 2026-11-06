import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site.config";
import { redirect } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/auth/guard";
import { GoogleSignInButton } from "@/components/admin/google-button";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;

  if (await getAdminSession()) redirect({ href: "/admin", locale });

  const t = await getTranslations("admin.login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-background p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {siteConfig.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {t("error")}
          </p>
        )}
        <GoogleSignInButton />
      </div>
    </main>
  );
}
