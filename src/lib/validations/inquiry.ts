import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^[+()\d\s.-]{6,30}$/),
    ])
    .optional(),
  message: z.string().trim().min(10).max(2000),
  propertyId: z.union([z.literal(""), z.string().uuid()]).optional(),
  locale: z.string().max(5).optional(),
  website: z.string().max(0).optional(), // honeypot: bots fill it, humans never see it
});

export type InquiryInput = z.infer<typeof inquirySchema>;
