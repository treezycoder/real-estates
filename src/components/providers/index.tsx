"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { siteConfig } from "@/config/site.config";
import { CurrencyProvider } from "./currency-provider";

export default function Providers({
  children,
  rates,
}: {
  children: React.ReactNode;
  rates: Record<string, number>;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider
        rates={rates}
        baseCurrency={siteConfig.currency.default}
        supported={siteConfig.currency.supported}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{ style: { borderRadius: "var(--radius)" } }}
        />
      </CurrencyProvider>
    </MotionConfig>
  );
}
