import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function removeFiles(keys: (string | null | undefined)[]) {
  const real = keys.filter((k): k is string => !!k && !k.startsWith("seed-"));
  if (!real.length) return;
  try {
    await utapi.deleteFiles(real);
  } catch (e) {
    console.error("UploadThing cleanup failed", e);
  }
}
