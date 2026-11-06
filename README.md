# Real Estate Website Template

A bilingual (EN/FR), multi-currency real estate website with an admin dashboard.
One codebase, one deployment per client; each client is configured, not re-coded.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · next-intl · Neon (Postgres) + Drizzle ·
Better Auth (Google) · UploadThing · framer-motion · react-hot-toast · react-icons · Leaflet/OpenStreetMap · Resend (optional)

## Features

- Listings with filters, sorting, pagination (URL-driven), gallery, map, WhatsApp/call buttons
- Inquiry form with honeypot, per-visitor rate limiting and email notification
- Language and currency switchers (default currency per client)
- SEO: sitemap, robots, hreflang, canonical URLs, JSON-LD
- Admin (Google sign-in, email allowlist): properties (EN/FR content, photos, map pin), agents, inquiries inbox

## Quick start for a new client

```bash
# 1. create a repo from this template, clone it, then:
npm install
npm run init:client      # writes src/config/client.ts and .env.local
# 2. fill DATABASE_URL, GOOGLE_CLIENT_ID/SECRET, UPLOADTHING_TOKEN in .env.local
npm run db:setup         # migrations + currency rates
npm run db:seed:demo     # optional, development databases only
npm run doctor           # checks env, config and database
npm run dev
```

Full launch procedure: [docs/new-client-checklist.md](docs/new-client-checklist.md)

## What you edit per client (and nothing else)

| What                                                               | Where                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| Name, contact, theme colors, currencies, map, admin email language | `src/config/client.ts`                               |
| Logo and favicon                                                   | `public/logo.svg`, `src/app/favicon.ico`             |
| Custom wording (hero, about page, ...)                             | `messages/client/en.json`, `messages/client/fr.json` |
| Secrets and per-client services                                    | `.env.local` / host environment variables            |
| Menu items and which home sections appear, in what order           | `src/config/site.config.ts`                          |

Keeping client changes in these files means pulling template updates stays conflict-free.

## Scripts

| Command                           | Purpose                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Standard Next.js                                                                 |
| `npm run init:client`             | Interactive client setup                                                         |
| `npm run db:generate`             | Create a migration after schema changes                                          |
| `npm run db:migrate`              | Apply migrations                                                                 |
| `npm run db:setup`                | Migrate and seed essentials (safe on any database)                               |
| `npm run db:seed:demo`            | Demo listings. **Development only**; refuses to run on a database with real data |
| `npm run db:studio`               | Browse the database                                                              |
| `npm run rates`                   | List exchange rates; `npm run rates -- USD 612` sets one                         |
| `npm run doctor`                  | Health check; add `-- --prod` with production env before launch                  |

## Environment variables

| Variable                                        | Required | Notes                                                        |
| ----------------------------------------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`                                  | yes      | Neon connection string                                       |
| `TENANT_ID`                                     | no       | Defaults to `default`. Keep it                               |
| `BETTER_AUTH_SECRET`                            | yes      | 32+ random chars                                             |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`       | yes      | Public site URL (https in production)                        |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`      | yes      | OAuth client; redirect URI `<site>/api/auth/callback/google` |
| `ADMIN_EMAILS`                                  | yes      | Comma-separated Google emails allowed into `/admin`          |
| `UPLOADTHING_TOKEN`                             | yes      | One UploadThing app per client                               |
| `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAILS` | no       | Inquiry emails; skipped when the key is absent               |
| `RATE_LIMIT_SALT`                               | no       | Falls back to `BETTER_AUTH_SECRET`                           |

## Project structure

```
src/
  app/[locale]/(public)/   public pages     (admin)/admin/   dashboard
  components/              ui, layout, sections, property, admin, motion, seo
  config/                  client.ts (per client), site.config.ts, property-options.ts
  lib/                     db (schema, queries, seeds), auth, actions, validations, email, seo
messages/                  base translations; messages/client/ = per-client overrides
scripts/                   init-client, doctor, set-rate
```

## Common changes

- **New home section:** create the component in `components/sections/`, register it in `sections/registry.ts`, add its key to `homeSections`.
- **New property type or feature:** add the key to `config/property-options.ts` (enum arrays update the DB enum, so run `db:generate` + `db:migrate` for property types), then add its label to `types.*` / `features.*` in both message files.
- **New currency:** add it to `client.currency.supported`, then `npm run rates -- XXX <value>`.
- **Exchange rates are manual.** Update them periodically with `npm run rates`. Prices are stored in the original currency and converted for display.
- **Never change the default currency after launch.** Listings store a base-currency price used for filtering and sorting, computed at save time.
- **Adding a third language** needs more than a message file: `i18n/routing.ts`, a new `messages/xx.json` + `messages/client/xx.json`, the `en`/`fr` fields in `lib/validations/property.ts`, `property-form-values.ts` and the form's language tabs, the agent bio fields, and `LocaleSwitcher` (it toggles between exactly two languages).

## Deploying

See the checklist. In short: set all env vars on the host, run migrations against the production
database from your machine (`DATABASE_URL=... npm run db:setup`), run
`npm run doctor -- --prod` with production values, then deploy. The database must be reachable at
build time because some pages are prerendered.

## Updating a client to a newer template version

```bash
git remote add template <template-repo-url>   # once
git fetch template && git merge template/main
```

Conflicts should be limited to `client.ts`, `messages/client/*`, and public assets. After merging, run `npm run db:generate` (should report no changes unless the template changed the schema), `npm run db:migrate`, and `npm run doctor`.

## Troubleshooting

| Symptom                                                           | Likely cause                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| "The default export is not a React Component in /[locale]/layout" | An empty `layout.tsx` or `page.tsx` somewhere under that route                             |
| `Unknown at rule: @theme`                                         | Tailwind v4 PostCSS plugin missing; check `postcss.config.mjs` uses `@tailwindcss/postcss` |
| `redirect_uri_mismatch` on Google sign-in                         | Redirect URI in Google Cloud doesn't exactly match `<site>/api/auth/callback/google`       |
| Google sign-in works only for some emails                         | OAuth consent screen is in Testing mode; add test users or publish it                      |
| Next.js "hostname not configured" for images                      | Host missing from `images.remotePatterns` in `next.config.ts`                              |
| "No exchange rate" when saving a listing                          | Run `npm run rates -- XXX <value>`                                                         |
