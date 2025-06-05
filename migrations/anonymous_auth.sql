-- Supabase Anonymous Auth schema setup

-- Profiles table linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0)
);

-- Consumption table scoped by user_id
create table if not exists consumption (
  id uuid primary key default gen_random_uuid(),
  drink_id uuid not null,
  quantity integer not null,
  units numeric not null,
  timestamp timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table consumption enable row level security;

-- RLS policies for profiles
create policy profiles_select on profiles
  for select using (auth.uid() = id);

create policy profiles_insert on profiles
  for insert with check (auth.uid() = id);

create policy profiles_update on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy profiles_delete on profiles
  for delete using (auth.uid() = id);

-- RLS policies for consumption
create policy consumption_select on consumption
  for select using (auth.uid() = user_id);

create policy consumption_insert on consumption
  for insert with check (user_id is null or user_id = auth.uid());

create policy consumption_update on consumption
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy consumption_delete on consumption
  for delete using (auth.uid() = user_id);

-- Trigger to auto-fill user_id
create or replace function set_user_id()
returns trigger language plpgsql as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger consumption_set_user_id
before insert on consumption
for each row execute procedure set_user_id();
