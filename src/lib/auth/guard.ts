import { cache } from "react";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "./index";
import { isAdminEmail } from "./admin";

export const getAdminSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  // Re-checked on every request: removing an email from ADMIN_EMAILS revokes access immediately
  if (!user.emailVerified || !isAdminEmail(user.email)) return null;
  return session;
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (session) return session;
  const locale = await getLocale();
  return redirect({ href: "/admin/login", locale });
}
