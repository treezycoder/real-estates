"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";
import { siteConfig } from "@/config/site.config";
import { db, TENANT_ID } from "@/lib/db";
import { inquiries, properties } from "@/lib/db/schema";
import { sendInquiryNotification } from "@/lib/email";
import { inquirySchema } from "@/lib/validations/inquiry";

const LIMIT = 5; // inquiries per visitor...
const WINDOW_MS = 60 * 60 * 1000; // ...per hour

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate_limited" | "server" };

// Only a salted hash of the IP is stored, never the address itself.
// No IP header (e.g. local dev) means no limiting.
async function visitorHash() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (!ip) return null;
  const salt =
    process.env.RATE_LIMIT_SALT ?? process.env.BETTER_AUTH_SECRET ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function submitInquiry(input: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const d = parsed.data;
  if (d.website) return { ok: true }; // honeypot hit: pretend success, store nothing

  try {
    const ipHash = await visitorHash();

    if (ipHash) {
      const [{ n }] = await db
        .select({ n: count() })
        .from(inquiries)
        .where(
          and(
            eq(inquiries.tenantId, TENANT_ID),
            eq(inquiries.ipHash, ipHash),
            gte(inquiries.createdAt, new Date(Date.now() - WINDOW_MS)),
          ),
        );
      if (n >= LIMIT) return { ok: false, error: "rate_limited" };
    }

    await db.insert(inquiries).values({
      tenantId: TENANT_ID,
      propertyId: d.propertyId || null,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      message: d.message,
      locale: d.locale ?? null,
      ipHash,
    });

    // Runs after the response is sent, so the visitor never waits for email
    after(async () => {
      try {
        let propertyTitle: string | null = null;
        if (d.propertyId) {
          const p = await db.query.properties.findFirst({
            where: and(
              eq(properties.id, d.propertyId),
              eq(properties.tenantId, TENANT_ID),
            ),
            with: { translations: true },
          });
          propertyTitle =
            (
              p?.translations.find(
                (t) => t.locale === siteConfig.adminLocale,
              ) ?? p?.translations[0]
            )?.title ?? null;
        }
        await sendInquiryNotification({
          name: d.name,
          email: d.email,
          phone: d.phone,
          message: d.message,
          propertyTitle,
        });
      } catch (e) {
        console.error("inquiry notification failed", e);
      }
    });

    return { ok: true };
  } catch (e) {
    console.error("submitInquiry failed", e);
    return { ok: false, error: "server" };
  }
}
