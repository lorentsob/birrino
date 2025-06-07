-- Favorites table for users to save their favorite drinks
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drink_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, drink_id)
);

-- Enable Row Level Security
alter table favorites enable row level security;

-- RLS policies for favorites
create policy favorites_select on favorites
  for select using (auth.uid() = user_id);

create policy favorites_insert on favorites
  for insert with check (auth.uid() = user_id);

create policy favorites_update on favorites
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy favorites_delete on favorites
  for delete using (auth.uid() = user_id); 