import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(neon(process.env.DATABASE_URL), { schema });

// Every query is scoped to this tenant. One deployment = one tenant for now,
// but this is the seam that lets us go multi-tenant later.
export const TENANT_ID = process.env.TENANT_ID ?? "default";
