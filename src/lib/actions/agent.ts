"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/guard";
import { db, TENANT_ID } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { removeFiles } from "@/lib/uploadthing-server";
import { agentSchema, type AgentInput } from "@/lib/validations/agent";

export type AgentResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "unauthorized" | "invalid" | "server";
      fields?: string[];
    };
export type SimpleResult = { ok: true } | { ok: false; error: string };

const isUuid = (s: string) => z.string().uuid().safeParse(s).success;
const refresh = () => revalidatePath("/", "layout");

function agentValues(d: AgentInput) {
  return {
    name: d.name,
    phone: d.phone || null,
    whatsapp: d.whatsapp || null,
    email: d.email || null,
    bio: d.bio,
    photoUrl: d.photo?.url ?? null,
    photoKey: d.photo?.fileKey ?? null,
  };
}

export async function createAgent(input: unknown): Promise<AgentResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };

  const parsed = agentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: parsed.error.issues.map((i) => i.path.join(".")),
    };
  }

  try {
    const [row] = await db
      .insert(agents)
      .values({ tenantId: TENANT_ID, ...agentValues(parsed.data) })
      .returning({ id: agents.id });
    refresh();
    return { ok: true, id: row.id };
  } catch (e) {
    console.error("createAgent failed", e);
    return { ok: false, error: "server" };
  }
}

export async function updateAgent(
  id: string,
  input: unknown,
): Promise<AgentResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!isUuid(id)) return { ok: false, error: "invalid" };

  const parsed = agentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      fields: parsed.error.issues.map((i) => i.path.join(".")),
    };
  }
  const d = parsed.data;

  try {
    const existing = await db.query.agents.findFirst({
      where: and(eq(agents.id, id), eq(agents.tenantId, TENANT_ID)),
    });
    if (!existing) return { ok: false, error: "invalid" };

    await db
      .update(agents)
      .set(agentValues(d))
      .where(and(eq(agents.id, id), eq(agents.tenantId, TENANT_ID)));

    if (existing.photoKey && existing.photoKey !== d.photo?.fileKey) {
      await removeFiles([existing.photoKey]);
    }

    refresh();
    return { ok: true, id };
  } catch (e) {
    console.error("updateAgent failed", e);
    return { ok: false, error: "server" };
  }
}

export async function deleteAgent(id: string): Promise<SimpleResult> {
  if (!(await getAdminSession())) return { ok: false, error: "unauthorized" };
  if (!isUuid(id)) return { ok: false, error: "invalid" };

  try {
    const existing = await db.query.agents.findFirst({
      where: and(eq(agents.id, id), eq(agents.tenantId, TENANT_ID)),
    });
    if (!existing) return { ok: false, error: "invalid" };

    // properties.agent_id is ON DELETE SET NULL, so listings stay online without an agent
    await db
      .delete(agents)
      .where(and(eq(agents.id, id), eq(agents.tenantId, TENANT_ID)));
    await removeFiles([existing.photoKey]);

    refresh();
    return { ok: true };
  } catch (e) {
    console.error("deleteAgent failed", e);
    return { ok: false, error: "server" };
  }
}
