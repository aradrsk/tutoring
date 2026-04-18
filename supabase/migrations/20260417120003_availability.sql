-- Teacher's recurring weekly windows. These are availability WINDOWS, not fixed slots.
-- Specific bookable start times are computed per chosen duration at query time.
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index availability_rules_day_idx on public.availability_rules (day_of_week) where active;

-- Date-specific overrides (vacation, holidays). A row here blocks the entire calendar date.
create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);
