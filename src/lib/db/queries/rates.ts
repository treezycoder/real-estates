import { db } from "../index";
import { currencyRates } from "../schema";

export async function getRates(): Promise<Record<string, number>> {
  const rows = await db.select().from(currencyRates);
  return Object.fromEntries(rows.map((r) => [r.code, Number(r.rateToBase)]));
}
