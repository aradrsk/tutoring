-- Helper: does the caller have role = 'teacher'?
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

-- Helper: is the caller's email verified? Reads auth.users directly (bypasses RLS via security definer).
create or replace function public.is_email_verified()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and email_confirmed_at is not null
  );
$$;

-- ===== profiles =====
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_teacher"
  on public.profiles for select
  using (auth.uid() = id or public.is_teacher());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent non-teachers from changing their own role (self-promotion to teacher).
-- Enforced as a trigger because RLS WITH CHECK cannot reference OLD.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_teacher() then
    raise exception 'role change not permitted';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ===== availability_rules =====
alter table public.availability_rules enable row level security;

create policy "availability_rules_public_read"
  on public.availability_rules for select
  using (true);

create policy "availability_rules_teacher_write"
  on public.availability_rules for all
  using (public.is_teacher())
  with check (public.is_teacher());

-- ===== availability_blocks =====
alter table public.availability_blocks enable row level security;

create policy "availability_blocks_public_read"
  on public.availability_blocks for select
  using (true);

create policy "availability_blocks_teacher_write"
  on public.availability_blocks for all
  using (public.is_teacher())
  with check (public.is_teacher());

-- ===== bookings =====
alter table public.bookings enable row level security;

create policy "bookings_select_own_or_teacher"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_teacher());

create policy "bookings_insert_self_verified"
  on public.bookings for insert
  with check (
    auth.uid() = user_id
    and public.is_email_verified()
    and status = 'confirmed'
  );

create policy "bookings_update_own_or_teacher"
  on public.bookings for update
  using (auth.uid() = user_id or public.is_teacher())
  with check (auth.uid() = user_id or public.is_teacher());

-- No delete policy: cancellation is modeled as status update, not row deletion.
