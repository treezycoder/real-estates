import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site.config";
import { ThemeStyle } from "@/components/layout/theme-style";
import Providers from "@/components/providers";
import "../globals.css";
import { getRates } from "@/lib/db/queries/rates";
import { siteUrl } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const revalidate = 3600;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // inside LocaleLayout, after setRequestLocale(locale):
  const rates = await getRates().catch(() => ({}) as Record<string, number>);

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <ThemeStyle />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider>
          <Providers rates={rates}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
