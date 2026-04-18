create type public.booking_status as enum ('confirmed', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  start_at timestamptz not null,
  duration_minutes int not null check (duration_minutes in (30, 45, 60)),
  status public.booking_status not null default 'confirmed',
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  -- Prevent overlapping CONFIRMED bookings regardless of order of insertion or duration mix.
  -- A 60-min booking at 16:00 and a 30-min booking at 16:30 both resolve to overlapping ranges
  -- and the second insert fails at the DB layer.
  constraint bookings_no_overlap exclude using gist (
    tstzrange(start_at, start_at + make_interval(mins => duration_minutes)) with &&
  ) where (status = 'confirmed')
);

create index bookings_user_idx on public.bookings (user_id, start_at desc);
create index bookings_start_idx on public.bookings (start_at) where status = 'confirmed';
