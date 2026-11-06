import { z } from "zod";

const phone = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .regex(/^[+()\d\s.-]{6,30}$/),
]);

export const agentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone,
  whatsapp: phone,
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  bio: z.object({
    en: z.string().trim().max(1000),
    fr: z.string().trim().max(1000),
  }),
  photo: z
    .object({
      url: z.string().url().max(500),
      fileKey: z.string().min(1).max(200),
    })
    .nullable(),
});

export type AgentInput = z.infer<typeof agentSchema>;
