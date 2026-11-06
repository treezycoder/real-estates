import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  AVAILABILITY,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_PERIODS,
} from "../../config/property-options";

/* ---------- Enums ---------- */
export const propertyTypeEnum = pgEnum("property_type", PROPERTY_TYPES);
export const listingTypeEnum = pgEnum("listing_type", LISTING_TYPES);
export const availabilityEnum = pgEnum("availability", AVAILABILITY);
export const rentPeriodEnum = pgEnum("rent_period", RENT_PERIODS);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "read",
  "replied",
  "closed",
]);

export type PropertyType = (typeof propertyTypeEnum.enumValues)[number];
export type ListingType = (typeof listingTypeEnum.enumValues)[number];

/* ---------- Shared columns ---------- */
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ---------- Agents ---------- */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: text("tenant_id").notNull().default("default"),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  photoKey: text("photo_key"), // UploadThing key, needed to delete the file later
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  bio: jsonb("bio")
    .$type<Record<string, string>>()
    .notNull()
    .default(sql`'{}'::jsonb`), // { en, fr }
  ...timestamps,
});

/* ---------- Properties ---------- */
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull().default("default"),
    slug: text("slug").notNull(),

    type: propertyTypeEnum("type").notNull(),
    listingType: listingTypeEnum("listing_type").notNull(),
    availability: availabilityEnum("availability")
      .notNull()
      .default("available"),

    // Price as entered, in its own currency
    price: numeric("price", { precision: 16, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("XAF"),
    // Same price converted to the site's default currency at save time.
    // Lets us filter and sort across mixed currencies.
    priceBase: numeric("price_base", { precision: 16, scale: 2 }).notNull(),
    rentPeriod: rentPeriodEnum("rent_period"),

    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    area: numeric("area", { precision: 10, scale: 2 }), // m²

    address: text("address"),
    city: text("city").notNull(),
    region: text("region"),
    country: varchar("country", { length: 2 }).notNull().default("CM"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),

    features: jsonb("features")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),

    agentId: uuid("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("properties_tenant_slug_uq").on(t.tenantId, t.slug),
    index("properties_listing_idx").on(t.tenantId, t.published, t.listingType),
    index("properties_city_idx").on(t.city),
    index("properties_price_idx").on(t.priceBase),
  ],
);

/* ---------- Translations (one row per property per locale) ---------- */
export const propertyTranslations = pgTable(
  "property_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 5 }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
  },
  (t) => [uniqueIndex("property_translations_uq").on(t.propertyId, t.locale)],
);

/* ---------- Images ---------- */
export const propertyImages = pgTable(
  "property_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    fileKey: text("file_key").notNull(), // UploadThing key
    alt: text("alt"),
    position: integer("position").notNull().default(0),
    isCover: boolean("is_cover").notNull().default(false),
  },
  (t) => [index("property_images_property_idx").on(t.propertyId, t.position)],
);

/* ---------- Inquiries ---------- */
export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull().default("default"),
    propertyId: uuid("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    locale: varchar("locale", { length: 5 }),
    status: inquiryStatusEnum("status").notNull().default("new"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("inquiries_status_idx").on(t.tenantId, t.status),
    index("inquiries_ip_idx").on(t.ipHash, t.createdAt),
  ],
);

/* ---------- Currency rates ---------- */
// rateToBase = how many units of the site's default currency equal 1 unit of this currency
export const currencyRates = pgTable("currency_rates", {
  code: varchar("code", { length: 3 }).primaryKey(),
  rateToBase: numeric("rate_to_base", { precision: 18, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Relations (for db.query.* with: {...}) ---------- */
export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(agents, { fields: [properties.agentId], references: [agents.id] }),
  translations: many(propertyTranslations),
  images: many(propertyImages),
  inquiries: many(inquiries),
}));

export const propertyTranslationsRelations = relations(
  propertyTranslations,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyTranslations.propertyId],
      references: [properties.id],
    }),
  }),
);

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
}));

export * from "./auth-schema";
