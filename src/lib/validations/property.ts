import { z } from "zod";
import {
  AVAILABILITY,
  FEATURE_KEYS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_PERIODS,
} from "@/config/property-options";
import { siteConfig } from "@/config/site.config";

const translation = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
});
const count = z.number().int().min(0).max(1000).nullable();

export const propertySchema = z
  .object({
    type: z.enum(PROPERTY_TYPES),
    listingType: z.enum(LISTING_TYPES),
    availability: z.enum(AVAILABILITY),
    price: z.number().positive().max(1e13),
    currency: z.enum(siteConfig.currency.supported as [string, ...string[]]),
    rentPeriod: z.enum(RENT_PERIODS).nullable(),
    bedrooms: count,
    bathrooms: count,
    area: z.number().positive().max(1e7).nullable(),
    address: z.string().trim().max(200),
    city: z.string().trim().min(2).max(80),
    region: z.string().trim().max(80),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
    features: z.array(z.enum(FEATURE_KEYS)).max(30),
    featured: z.boolean(),
    published: z.boolean(),
    agentId: z.string().uuid().nullable(),
    translations: z.object({ en: translation, fr: translation }),
    images: z
      .array(
        z.object({
          url: z.string().url().max(500),
          fileKey: z.string().min(1).max(200),
          alt: z.string().max(200).nullable(),
        }),
      )
      .max(20),
  })
  .superRefine((d, ctx) => {
    if (d.listingType === "rent" && !d.rentPeriod) {
      ctx.addIssue({
        code: "custom",
        path: ["rentPeriod"],
        message: "required",
      });
    }
    if ((d.lat == null) !== (d.lng == null)) {
      ctx.addIssue({ code: "custom", path: ["lat"], message: "required" });
    }
  });

export type PropertyInput = z.infer<typeof propertySchema>;
