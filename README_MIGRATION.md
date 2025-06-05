# Migration Instructions

This document provides instructions on how to fix the conflicts between `user_name` and `user_id` in the database.

## The Problem

The application was encountering errors because:

1. The `users` table no longer exists in the database
2. The code was still trying to reference the `user_name` column in the `consumption` table
3. User authentication is now handled through Supabase Auth and profiles

## Solution

### 1. Database Changes

Run the following SQL in your Supabase SQL Editor:

```sql
-- Drop the user_name column from consumption table
ALTER TABLE IF EXISTS public.consumption DROP COLUMN IF EXISTS user_name;

-- Drop the users table if it exists (it's already gone, but just to be sure)
DROP TABLE IF EXISTS public.users;
```

### 2. Code Changes

The following files have been updated:

1. `components/UserSelect.tsx`:

   - Now uses the `profiles` table instead of `users`
   - Stores user data in localStorage for persistence
   - Uses `display_name` instead of `name`

2. `components/DashboardClient.tsx`:

   - Gets the user ID from localStorage instead of the session
   - Uses `user_id` instead of `user_name` for queries

3. `app/dashboard/page.tsx`:

   - New page that loads user data from localStorage
   - Redirects to home if no user is selected

4. `lib/types.ts`:

   - Updated the `Consumption` type to use `user_id` instead of `user_name`

5. Other components:
   - Updated to use `user_id` instead of `user_name`

## How the New Flow Works

1. User selects or creates a profile on the home page
2. User ID and name are stored in localStorage
3. User is redirected to the dashboard
4. Dashboard loads data based on the user ID from localStorage
5. All database operations use `user_id` which is linked to Supabase Auth

## Testing

1. Make sure you've run the SQL migration
2. Clear your browser's localStorage
3. Try creating a new user
4. Verify that you can add drinks and see your consumption data
