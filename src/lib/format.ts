export function formatPrice(
  amount: number | string,
  currency: string,
  locale: string,
) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "XAF" ? 0 : 2,
  }).format(Number(amount));
}

/** rates[code] = units of the base currency per 1 unit of `code` */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
) {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount * fromRate) / toRate;
}

export function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
