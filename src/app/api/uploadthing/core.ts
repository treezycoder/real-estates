import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminSession } from "@/lib/auth/guard";

const f = createUploadthing();

async function adminOnly() {
  const session = await getAdminSession();
  if (!session) throw new UploadThingError("Unauthorized");
  return { userId: session.user.id };
}

export const ourFileRouter = {
  propertyImages: f({ image: { maxFileSize: "8MB", maxFileCount: 15 } })
    .middleware(adminOnly)
    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.userId,
    })),
  agentPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(adminOnly)
    .onUploadComplete(async ({ metadata }) => ({
      uploadedBy: metadata.userId,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
