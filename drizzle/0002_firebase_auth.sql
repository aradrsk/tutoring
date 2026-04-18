-- Drop better-auth tables (Firebase owns identity now).
DROP TABLE IF EXISTS "session" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "account" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "verification" CASCADE;
--> statement-breakpoint

-- Normalize user column names to snake_case to match app conventions.
ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "email_verified";
--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";
--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";
--> statement-breakpoint

-- Relax defaults so a fresh Firebase upsert doesn't have to supply timestamps.
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint

-- Allow an empty display name on first OAuth signup (Google sometimes omits it).
ALTER TABLE "user" ALTER COLUMN "name" SET DEFAULT '';
--> statement-breakpoint

-- Truncate any residual better-auth users — Firebase UIDs won't match their IDs.
TRUNCATE TABLE "user" CASCADE;
