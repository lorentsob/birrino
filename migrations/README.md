# Database Migrations

This directory contains SQL migrations for the Supabase database.

## Running Migrations

To run the migrations, you can use the Supabase CLI or execute them directly in the Supabase SQL editor.

### Using Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of the migration file (e.g., `create_recents_table.sql`)
5. Paste the SQL into the editor
6. Run the query

### Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push -f migrations/create_recents_table.sql
```

## Migration Files

- `create_recents_table.sql`: Creates the `recents` table which stores recently used drinks for each user
