-- Stripe payment tracking on bookings.
CREATE TYPE "public"."payment_status" AS ENUM ('free', 'pending', 'paid', 'refunded');
--> statement-breakpoint

ALTER TABLE "bookings"
  ADD COLUMN "payment_status" "public"."payment_status" NOT NULL DEFAULT 'free';
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "price_cents" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_session_id" text;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "paid_at" timestamptz;
