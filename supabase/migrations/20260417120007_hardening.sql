-- Hardening pass from TU-5 adversarial review.

-- ===== profiles: enforce invariants at the DB layer =====
-- Reason: RLS UPDATE on profiles is allowed for own row, so a user could blank their
-- name or null their age. Server-action validation is advisory; the DB is the boundary.
alter table public.profiles
  alter column age set not null,
  add constraint profiles_name_nonempty check (length(trim(name)) between 1 and 100);

-- Tighten auto-create trigger: reject malformed metadata instead of storing garbage.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(new.raw_user_meta_data ->> 'name', ''));
  v_age_raw text := new.raw_user_meta_data ->> 'age';
  v_age int;
begin
  if length(v_name) = 0 then
    raise exception 'signup requires a name';
  end if;

  -- Safe cast: reject non-numeric age rather than throwing a cryptic 22P02.
  if v_age_raw is null or v_age_raw = '' or v_age_raw !~ '^\d+$' then
    raise exception 'signup requires a numeric age';
  end if;
  v_age := v_age_raw::int;

  insert into public.profiles (id, name, age)
  values (new.id, v_name, v_age);
  return new;
end;
$$;

-- ===== bookings: forbid rewriting time/duration post-insert =====
-- Reason: user could UPDATE their booking to move slots, bypassing the INSERT-time
-- verification check and any future booking-window business logic. Cancellation is
-- the only legitimate post-insert mutation from the user side.
create or replace function public.bookings_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id is immutable';
  end if;
  if new.start_at is distinct from old.start_at
     or new.duration_minutes is distinct from old.duration_minutes then
    raise exception 'booking time and duration cannot be changed; cancel and rebook';
  end if;
  -- Only legal status transition for end-users: confirmed -> cancelled.
  -- Teacher can do the same; reactivation of a cancelled booking is not allowed.
  if old.status = 'cancelled' and new.status = 'confirmed' then
    raise exception 'cancelled bookings cannot be reactivated';
  end if;
  if new.status = 'cancelled' and old.status = 'confirmed' and new.cancelled_at is null then
    new.cancelled_at := now();
    new.cancelled_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger bookings_guard_update_trigger
  before update on public.bookings
  for each row execute function public.bookings_guard_update();

-- ===== teacher self-demotion =====
-- Prevent a teacher from demoting themselves to 'user'. Re-promotion requires
-- service role, so a self-demotion is a soft-lockout for the single-teacher v1.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if old.role = 'teacher' and new.role = 'user' then
      raise exception 'teachers cannot self-demote';
    end if;
    if not public.is_teacher() then
      raise exception 'role change not permitted';
    end if;
  end if;
  return new;
end;
$$;
