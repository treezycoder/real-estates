# New client checklist

Time estimate for a practiced run: under an hour, plus DNS propagation.

## A. Accounts and services (one set per client)

- [ ] **Repo:** create from the template, clone locally
- [ ] **Neon:** new project/database; copy the connection string. If migrations behave oddly with a pooled connection string, use the direct (non-pooled) one for `db:migrate`
- [ ] **Google Cloud:** OAuth client (Web). Redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://<domain>/api/auth/callback/google`. Publish the consent screen, or add every admin as a test user
- [ ] **UploadThing:** new app; copy the token
- [ ] **Resend (optional):** create an API key; verify the client's sending domain
- [ ] **Hosting (e.g. Vercel):** project connected to the repo
- [ ] **Domain:** purchased/available, DNS access confirmed

## B. Configure

- [ ] `npm install` then `npm run init:client`
- [ ] Review `src/config/client.ts` (colors, map center and zoom, currencies)
- [ ] Replace `public/logo.svg` and `src/app/favicon.ico`
- [ ] Fill `.env.local`: `DATABASE_URL`, Google keys, `UPLOADTHING_TOKEN` (and Resend keys if used)
- [ ] Edit `messages/client/en.json` and `fr.json` for the client's wording (hero, about)
- [ ] Adjust `nav` / `homeSections` in `site.config.ts` if needed

## C. Database

- [ ] `npm run db:setup`
- [ ] Set non-pegged currency rates: `npm run rates -- USD <value>`
- [ ] (Dev databases only) `npm run db:seed:demo` to preview the design; never on the client's real database
- [ ] `npm run doctor` shows no errors

## D. Test locally

- [ ] Admin sign-in works with an allowlisted email; a non-listed Google account is rejected
- [ ] Add an agent with a photo; add a property in EN and FR with photos and a map pin
- [ ] Property shows on `/en` and `/fr`, filters work, currency switcher converts
- [ ] Inquiry form works; the inquiry appears in the admin inbox (and the email arrives if configured)
- [ ] 404 page, `/sitemap.xml` and `/robots.txt` look right

## E. Go live

- [ ] Create a git-ignored `.env.prod` with the **production** values (https URLs, production DB, Google keys, etc.)
- [ ] Run migrations on production: `DATABASE_URL=<prod> npm run db:setup` (PowerShell: `$env:DATABASE_URL="<prod>"; npm run db:setup`)
- [ ] `npx tsx --env-file=.env.prod scripts/doctor.ts --prod` shows **0 errors**
- [ ] Set all env vars on the host (`NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` = the public https URL)
- [ ] Deploy, attach the domain, confirm HTTPS
- [ ] Sign in to `/en/admin` on the live site; create a real listing; submit a real inquiry
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console
- [ ] Confirm the inquiry rate limit works on the live site (6th message within an hour is refused)

## F. Handover

- [ ] Show the client: add/edit property, photos (first photo is the cover), publish/unpublish, featured, agents, inquiries
- [ ] Tell them what is **not** self-service: exchange rates (you run `npm run rates`), site copy changes (via `messages/client`), theme/config changes
- [ ] Explain that `ADMIN_EMAILS` controls who can sign in; changing it needs a redeploy or env update
- [ ] Record: Neon project, Google OAuth client, UploadThing app, Resend domain, hosting project, domain registrar

## G. After launch

- [ ] Review exchange rates periodically
- [ ] Check Neon and UploadThing usage against the plan limits
- [ ] Merge template updates (see README) and run `npm run doctor`
