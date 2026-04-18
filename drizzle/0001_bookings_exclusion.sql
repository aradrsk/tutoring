-- Required for the tstzrange exclusion constraint below.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint

-- Materialize the end timestamp so the exclusion expression contains only
-- IMMUTABLE operations (tstzrange of two concrete columns). We can't use
-- `start_at + interval` in the index expression because the `+` operator
-- for timestamptz+interval is marked STABLE (timezone-dependent).
ALTER TABLE "bookings" ADD COLUMN "end_at" timestamptz;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.bookings_set_end_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.end_at := NEW.start_at + NEW.duration_minutes * interval '1 minute';
  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER bookings_set_end_at_trigger
  BEFORE INSERT OR UPDATE OF start_at, duration_minutes ON "bookings"
  FOR EACH ROW EXECUTE FUNCTION public.bookings_set_end_at();
--> statement-breakpoint

-- Prevent overlapping CONFIRMED bookings across any duration mix.
-- 60-min @ 16:00 and 30-min @ 16:30 both resolve to overlapping [16:00, 17:00)
-- ranges and the second insert fails at the DB layer.
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status = 'confirmed');
