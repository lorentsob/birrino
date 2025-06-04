-- Alter the consumption table to make user_name nullable
ALTER TABLE IF EXISTS public.consumption ALTER COLUMN user_name DROP NOT NULL; 