# Migration Instructions

This document provides instructions on how to fix the conflicts between `user_name` and `user_id` in the database.

## Background

The codebase had conflicts due to two columns in the database: `user_name` and `user_id`. The repository already includes the new structure with the `profiles` table and `consumption` linked to `auth.users` via `user_id`.

## Changes Made

1. Updated the code to remove all references to `user_name` and the `users` table
2. Changed all queries to use `user_id` instead of `user_name`
3. Modified components to rely on the automatic filling of `user_id` by the database trigger
4. Created a migration file to drop the `user_name` column and the `users` table

## Applying the Database Changes

To apply the database changes, run the following SQL commands in your Supabase SQL editor:

```sql
-- Drop the user_name column from consumption table
ALTER TABLE consumption DROP COLUMN IF EXISTS user_name;

-- Drop the users table if it exists
DROP TABLE IF EXISTS users;
```

## Verifying the Changes

After applying the changes:

1. The `consumption` table should only have `user_id` and no `user_name` column
2. The `users` table should no longer exist
3. The application should work correctly with user identification based solely on `user_id`

## Implementation Details

- The `user_id` is automatically filled by the database trigger `set_user_id` when inserting into the `consumption` table
- User display names are now stored in the `profiles` table with a foreign key to `auth.users(id)`
- All components have been updated to use `user_id` instead of `user_name`
