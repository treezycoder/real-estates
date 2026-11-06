import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/guard";
import { getNewInquiryCount } from "@/lib/db/queries/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireAdmin();
  const newInquiries = await getNewInquiryCount();

  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      <AdminNav email={session.user.email} newInquiries={newInquiries} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
