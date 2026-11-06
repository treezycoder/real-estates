"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { notify } from "@/lib/notify";

export function GoogleSignInButton() {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `/${locale}/admin`,
        errorCallbackURL: `/${locale}/admin/login`,
      });
    } catch {
      notify.error(t("error"));
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={pending}
    >
      <FcGoogle size={22} /> {t("google")}
    </Button>
  );
}
