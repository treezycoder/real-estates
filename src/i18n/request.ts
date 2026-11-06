import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { deepMerge } from "@/lib/deep-merge";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../../messages/${locale}.json`)).default;
  const override = (await import(`../../messages/client/${locale}.json`))
    .default;

  return { locale, messages: deepMerge(base, override) };
});
