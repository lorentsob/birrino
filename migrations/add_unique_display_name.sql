-- Ensure display_name is unique across all profiles (case-insensitive)
create unique index if not exists profiles_display_name_unique
  on profiles (lower(display_name));
