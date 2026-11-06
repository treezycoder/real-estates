ALTER TABLE "inquiries" ADD COLUMN "ip_hash" text;--> statement-breakpoint
CREATE INDEX "inquiries_ip_idx" ON "inquiries" USING btree ("ip_hash","created_at");