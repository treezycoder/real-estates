import { and, asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { InquiryStatus } from "@/config/property-options";
import { db, TENANT_ID } from "../index";
import { agents, inquiries, properties } from "../schema";

export function pickTitle(
  translations: { locale: string; title: string }[],
  locale: string,
) {
  return (
    (translations.find((t) => t.locale === locale) ?? translations[0])?.title ??
    ""
  );
}

export async function getNewInquiryCount() {
  const [row] = await db
    .select({ n: count() })
    .from(inquiries)
    .where(and(eq(inquiries.tenantId, TENANT_ID), eq(inquiries.status, "new")));
  return row.n;
}

export async function getAdminStats() {
  const base = eq(properties.tenantId, TENANT_ID);
  const [[total], [published], [featured], newInquiries] = await Promise.all([
    db.select({ n: count() }).from(properties).where(base),
    db
      .select({ n: count() })
      .from(properties)
      .where(and(base, eq(properties.published, true))),
    db
      .select({ n: count() })
      .from(properties)
      .where(and(base, eq(properties.featured, true))),
    getNewInquiryCount(),
  ]);
  return {
    total: total.n,
    published: published.n,
    featured: featured.n,
    newInquiries,
  };
}

export async function getAdminProperties() {
  return db.query.properties.findMany({
    where: eq(properties.tenantId, TENANT_ID),
    with: {
      translations: true,
      images: { orderBy: (i, { asc }) => [asc(i.position)] },
    },
    orderBy: desc(properties.createdAt),
  });
}

export async function getAdminProperty(id: string) {
  if (!z.string().uuid().safeParse(id).success) return null;
  return db.query.properties.findFirst({
    where: and(eq(properties.tenantId, TENANT_ID), eq(properties.id, id)),
    with: {
      translations: true,
      images: { orderBy: (i, { asc }) => [asc(i.position)] },
    },
  });
}

export async function getAgents() {
  return db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(eq(agents.tenantId, TENANT_ID))
    .orderBy(asc(agents.name));
}

export async function getInquiries(status?: InquiryStatus, limit = 100) {
  return db.query.inquiries.findMany({
    where: and(
      eq(inquiries.tenantId, TENANT_ID),
      status ? eq(inquiries.status, status) : undefined,
    ),
    with: { property: { with: { translations: true } } },
    orderBy: desc(inquiries.createdAt),
    limit,
  });
}

export async function getAdminAgents() {
  return db.query.agents.findMany({
    where: eq(agents.tenantId, TENANT_ID),
    with: { properties: { columns: { id: true } } },
    orderBy: asc(agents.name),
  });
}

export async function getAdminAgent(id: string) {
  if (!z.string().uuid().safeParse(id).success) return null;
  return db.query.agents.findFirst({
    where: and(eq(agents.tenantId, TENANT_ID), eq(agents.id, id)),
  });
}
