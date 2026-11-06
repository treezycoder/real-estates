"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { INQUIRY_STATUSES } from "@/config/property-options";
import { getAdminSession } from "@/lib/auth/guard";
import { db, TENANT_ID } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";

type Result = { ok: true } | { ok: false; error: string };

export async function updateInquiryStatus(
  id: string,
  status: string,
): Promise<Result> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  const parsed = z
    .object({ id: z.string().uuid(), status: z.enum(INQUIRY_STATUSES) })
    .safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    await db
      .update(inquiries)
      .set({ status: parsed.data.status })
      .where(
        and(
          eq(inquiries.id, parsed.data.id),
          eq(inquiries.tenantId, TENANT_ID),
        ),
      );
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error("updateInquiryStatus failed", e);
    return { ok: false, error: "server" };
  }
}

export async function deleteInquiry(id: string): Promise<Result> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!z.string().uuid().safeParse(id).success)
    return { ok: false, error: "invalid" };

  try {
    await db
      .delete(inquiries)
      .where(and(eq(inquiries.id, id), eq(inquiries.tenantId, TENANT_ID)));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error("deleteInquiry failed", e);
    return { ok: false, error: "server" };
  }
}
