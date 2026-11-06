"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { convertAmount, formatPrice } from "@/lib/format";

type Ctx = {
  currency: string;
  setCurrency: (code: string) => void;
  supported: string[];
  format: (
    amount: number,
    from: string,
  ) => { text: string; original: string; converted: boolean };
};

const CurrencyContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "currency";

export function CurrencyProvider({
  children,
  rates,
  baseCurrency,
  supported,
}: {
  children: React.ReactNode;
  rates: Record<string, number>;
  baseCurrency: string;
  supported: string[];
}) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState(baseCurrency);
  const allRates = useMemo(
    () => ({ ...rates, [baseCurrency]: 1 }),
    [rates, baseCurrency],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && supported.includes(saved)) setCurrencyState(saved);
    } catch {}
  }, [supported]);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }, []);

  const format = useCallback(
    (amount: number, from: string) => {
      const original = formatPrice(amount, from, locale);
      if (from === currency || !allRates[from] || !allRates[currency]) {
        return { text: original, original, converted: false };
      }
      const value = convertAmount(amount, from, currency, allRates);
      return {
        text: formatPrice(value, currency, locale),
        original,
        converted: true,
      };
    },
    [currency, allRates, locale],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, supported, format }),
    [currency, setCurrency, supported, format],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
