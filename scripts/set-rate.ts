import { client } from "../src/config/client";
import { db } from "../src/lib/db";
import { currencyRates } from "../src/lib/db/schema";

const base = client.currency.default;

async function main() {
  const [codeArg, valueArg] = process.argv.slice(2);

  if (!codeArg) {
    const rows = await db.select().from(currencyRates);
    console.log(`\nRates (${base} per 1 unit):`);
    rows.forEach((r) => console.log(`  ${r.code}: ${Number(r.rateToBase)}`));
    console.log(`\nSet one with: npm run rates -- USD 612\n`);
    return;
  }

  const code = codeArg.toUpperCase();
  const rate = Number(valueArg);
  if (!client.currency.supported.includes(code) || code === base) {
    throw new Error(
      `${code} must be one of the supported non-default currencies: ${client.currency.supported.filter((c) => c !== base).join(", ")}`,
    );
  }
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error("Rate must be a positive number");

  await db
    .insert(currencyRates)
    .values({ code, rateToBase: rate.toFixed(6) })
    .onConflictDoUpdate({
      target: currencyRates.code,
      set: { rateToBase: rate.toFixed(6) },
    });
  console.log(`✓ 1 ${code} = ${rate} ${base}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
