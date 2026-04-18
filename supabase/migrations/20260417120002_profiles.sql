-- profiles: extends auth.users with app-level fields.
create type public.user_role as enum ('teacher', 'user');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  age int check (age is null or (age between 5 and 18)),
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on auth.users insert, pulling name/age from raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, age)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), ''),
    nullif(new.raw_user_meta_data ->> 'age', '')::int
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
