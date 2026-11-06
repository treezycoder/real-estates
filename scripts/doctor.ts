import { existsSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { client } from "../src/config/client";

type Level = "ok" | "warn" | "fail";
const results: { level: Level; message: string }[] = [];
const add = (level: Level, message: string) => results.push({ level, message });
const env = (key: string) => (process.env[key] ?? "").trim();
const prod = process.argv.includes("--prod");

const origin = (v: string) => {
  try {
    return new URL(v).origin;
  } catch {
    return null;
  }
};

function checkEnv() {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_SITE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ADMIN_EMAILS",
    "UPLOADTHING_TOKEN",
  ];
  const missing = required.filter((k) => !env(k));
  missing.forEach((k) => add("fail", `${k} is not set`));
  if (!missing.length) add("ok", "All required environment variables are set");

  if (env("DATABASE_URL") && !/^postgres(ql)?:\/\//.test(env("DATABASE_URL"))) {
    add("fail", "DATABASE_URL must start with postgresql://");
  }
  if (env("BETTER_AUTH_SECRET") && env("BETTER_AUTH_SECRET").length < 32) {
    add("fail", "BETTER_AUTH_SECRET should be at least 32 characters");
  }

  for (const key of ["NEXT_PUBLIC_SITE_URL", "BETTER_AUTH_URL"]) {
    const value = env(key);
    if (!value) continue;
    const o = origin(value);
    if (!o) add("fail", `${key} is not a valid URL`);
    else if (
      prod &&
      (!o.startsWith("https://") || /localhost|127\.0\.0\.1/.test(o))
    ) {
      add(
        "fail",
        `${key} must be a public https URL in production (got ${value})`,
      );
    }
  }
  const site = origin(env("NEXT_PUBLIC_SITE_URL"));
  const auth = origin(env("BETTER_AUTH_URL"));
  if (site && auth && site !== auth) {
    add(
      "warn",
      "NEXT_PUBLIC_SITE_URL and BETTER_AUTH_URL differ (usually they should match)",
    );
  }

  const admins = env("ADMIN_EMAILS")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (admins.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) {
    add("fail", "ADMIN_EMAILS contains an invalid address");
  }

  if (!env("RESEND_API_KEY")) {
    add(
      "warn",
      "RESEND_API_KEY not set: inquiry notification emails are disabled",
    );
  } else if (!env("EMAIL_FROM")) {
    add(
      prod ? "fail" : "warn",
      "RESEND_API_KEY is set but EMAIL_FROM is missing",
    );
  } else if (prod && /resend\.dev/.test(env("EMAIL_FROM"))) {
    add(
      "warn",
      "EMAIL_FROM uses the resend.dev test sender; verify the client's domain in Resend",
    );
  }
}

function checkClientConfig() {
  if (client.name === "Your Agency")
    add("warn", "client.ts still has the placeholder business name");
  if (/example\.com/.test(client.contact.email))
    add("warn", "client.ts still has the placeholder contact email");
  if (
    !existsSync(
      path.join(process.cwd(), "public", client.logo.replace(/^\//, "")),
    )
  ) {
    add("warn", `Logo file public${client.logo} was not found`);
  }
  if (!client.currency.supported.includes(client.currency.default)) {
    add(
      "fail",
      "client.currency.default must be listed in client.currency.supported",
    );
  }
}

async function checkDatabase() {
  const url = env("DATABASE_URL");
  if (!url) return;
  try {
    const sql = neon(url);
    const tenant = env("TENANT_ID") || "default";

    const [{ t }] = await sql`select to_regclass('public.properties') as t`;
    if (!t)
      return add(
        "fail",
        "Database is reachable but not migrated. Run: npm run db:setup",
      );
    add("ok", "Database reachable and migrated");

    const rates = await sql`select code from currency_rates`;
    const have = new Set(rates.map((r) => r.code as string));
    const lacking = client.currency.supported.filter(
      (c) => c !== client.currency.default && !have.has(c),
    );
    if (lacking.length) {
      add(
        "warn",
        `No exchange rate for ${lacking.join(", ")}. Run: npm run rates -- ${lacking[0]} <value>`,
      );
    } else add("ok", "Exchange rates present for all supported currencies");

    const [{ n: demo }] =
      await sql`select count(*)::int as n from property_images where file_key like 'seed-%'`;
    if (demo > 0)
      add(
        prod ? "fail" : "warn",
        `${demo} demo image(s) from the seed are in the database`,
      );

    const [{ n: listings }] =
      await sql`select count(*)::int as n from properties where tenant_id = ${tenant}`;
    if (listings === 0) add("warn", "No properties yet for this tenant");
  } catch (e) {
    add("fail", `Could not query the database: ${(e as Error).message}`);
  }
}

async function main() {
  console.log(`\nDoctor (${prod ? "production" : "development"} mode)\n`);
  checkEnv();
  checkClientConfig();
  await checkDatabase();

  const icon = { ok: "✓", warn: "⚠", fail: "✗" } as const;
  results.forEach((r) => console.log(`${icon[r.level]} ${r.message}`));

  const fails = results.filter((r) => r.level === "fail").length;
  const warns = results.filter((r) => r.level === "warn").length;
  console.log(`\n${fails} error(s), ${warns} warning(s)\n`);
  process.exit(fails ? 1 : 0);
}

main();
