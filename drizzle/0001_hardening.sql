-- P0 hardening: verification fields, admin action log, indexes for the
-- filters the listings page actually runs.

CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected');
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "verification_status" "verification_status" DEFAULT 'unverified' NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "verified_by" uuid;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "verified_at" timestamp;
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" text,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "admin_actions_target_idx" ON "admin_actions" ("target_type", "target_id");
--> statement-breakpoint
CREATE INDEX "admin_actions_admin_idx" ON "admin_actions" ("admin_id", "created_at");
--> statement-breakpoint

-- Listings search: status is in every public query, then the common filters
CREATE INDEX "properties_public_list_idx" ON "properties" ("status", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "properties_status_city_type_deal_idx" ON "properties" ("status", "city", "type", "deal_type");
--> statement-breakpoint
CREATE INDEX "properties_status_price_idx" ON "properties" ("status", "price");
--> statement-breakpoint
CREATE INDEX "properties_owner_idx" ON "properties" ("owner_id", "status");
--> statement-breakpoint
CREATE INDEX "properties_featured_idx" ON "properties" ("is_featured", "status") WHERE "is_featured" = true;
--> statement-breakpoint
CREATE INDEX "property_images_property_idx" ON "property_images" ("property_id", "order");
--> statement-breakpoint
CREATE INDEX "favorites_user_idx" ON "favorites" ("user_id", "created_at" DESC);
--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_property_uidx" ON "favorites" ("user_id", "property_id");
--> statement-breakpoint
CREATE INDEX "leads_property_idx" ON "leads" ("property_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "leads_agent_idx" ON "leads" ("agent_id", "status");
--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" ("user_id", "is_read", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" ("user_id");
--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" ("expires_at");
--> statement-breakpoint
-- One review per reviewer per target (§3.1)
CREATE UNIQUE INDEX "reviews_reviewer_target_uidx" ON "reviews" ("reviewer_id", "target_type", "target_id");
