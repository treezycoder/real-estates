"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiHome, FiRefreshCw } from "react-icons/fi";
import { Button, buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.generic");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center">
      <Container className="max-w-xl py-16 text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("text")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <FiRefreshCw /> {t("retry")}
          </Button>
          <Link href="/" className={buttonStyles({ variant: "outline" })}>
            <FiHome /> {t("home")}
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            {t("reference", { id: error.digest })}
          </p>
        )}
      </Container>
    </main>
  );
}
