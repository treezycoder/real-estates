import { client } from "../../config/client";
import { db } from "./index";
import { currencyRates } from "./schema";

const BASE = client.currency.default;
const XAF_PER_EUR = 655.957; // fixed peg

// Only the XAF/EUR peg is a fixed rate. Anything else must be set with `npm run rates`.
function pegged(code: string): number | null {
  if (code === BASE) return 1;
  if (BASE === "XAF" && code === "EUR") return XAF_PER_EUR;
  if (BASE === "EUR" && code === "XAF") return 1 / XAF_PER_EUR;
  return null;
}

async function main() {
  const missing: string[] = [];

  for (const code of client.currency.supported) {
    const rate = pegged(code);
    if (rate == null) {
      missing.push(code);
      continue;
    }
    await db
      .insert(currencyRates)
      .values({ code, rateToBase: rate.toFixed(6) })
      .onConflictDoUpdate({
        target: currencyRates.code,
        set: { rateToBase: rate.toFixed(6) },
      });
  }

  console.log("✓ Essential data ready");
  missing.forEach((c) =>
    console.log(
      `⚠ Set the ${c} rate: npm run rates -- ${c} <how many ${BASE} equal 1 ${c}>`,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
