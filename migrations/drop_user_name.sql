-- Drop the user_name column from consumption table
ALTER TABLE IF EXISTS public.consumption DROP COLUMN IF EXISTS user_name;

-- Drop the users table if it exists
DROP TABLE IF EXISTS public.users; 