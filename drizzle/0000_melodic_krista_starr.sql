CREATE TYPE "public"."availability" AS ENUM('available', 'reserved', 'sold', 'rented');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'read', 'replied', 'closed');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('house', 'villa', 'apartment', 'land', 'commercial', 'office');--> statement-breakpoint
CREATE TYPE "public"."rent_period" AS ENUM('month', 'year', 'night');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"photo_key" text,
	"phone" text,
	"whatsapp" text,
	"email" text,
	"bio" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"rate_to_base" numeric(18, 6) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"property_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"locale" varchar(5),
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"slug" text NOT NULL,
	"type" "property_type" NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"availability" "availability" DEFAULT 'available' NOT NULL,
	"price" numeric(16, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'XAF' NOT NULL,
	"price_base" numeric(16, 2) NOT NULL,
	"rent_period" "rent_period",
	"bedrooms" integer,
	"bathrooms" integer,
	"area" numeric(10, 2),
	"address" text,
	"city" text NOT NULL,
	"region" text,
	"country" varchar(2) DEFAULT 'CM' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"agent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"url" text NOT NULL,
	"file_key" text NOT NULL,
	"alt" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_translations" ADD CONSTRAINT "property_translations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_tenant_slug_uq" ON "properties" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "properties_listing_idx" ON "properties" USING btree ("tenant_id","published","listing_type");--> statement-breakpoint
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price_base");--> statement-breakpoint
CREATE INDEX "property_images_property_idx" ON "property_images" USING btree ("property_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "property_translations_uq" ON "property_translations" USING btree ("property_id","locale");