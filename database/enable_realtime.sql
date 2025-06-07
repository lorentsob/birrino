-- Enable real-time for the favorites table
alter publication supabase_realtime add table favorites;

-- Create a trigger to ensure real-time updates work properly
create or replace function public.handle_favorites_changes()
returns trigger as $$
begin
  if (TG_OP = 'DELETE') then
    perform pg_notify(
      'postgres_changes',
      json_build_object(
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'eventType', TG_OP,
        'old', row_to_json(OLD)
      )::text
    );
    return OLD;
  else
    perform pg_notify(
      'postgres_changes',
      json_build_object(
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'eventType', TG_OP,
        'new', row_to_json(NEW)
      )::text
    );
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists
drop trigger if exists on_favorites_changes on favorites;

-- Create the trigger
create trigger on_favorites_changes
  after insert or update or delete on favorites
  for each row execute procedure public.handle_favorites_changes(); 