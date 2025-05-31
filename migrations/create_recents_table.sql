-- Create the recents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recents (
    user_id TEXT NOT NULL,
    drink_id TEXT NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, drink_id)
);

-- Add RLS policies
ALTER TABLE public.recents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own recents
CREATE POLICY "Users can read their own recents" ON public.recents
    FOR SELECT
    USING (true);

-- Create policy to allow users to insert their own recents
CREATE POLICY "Users can insert their own recents" ON public.recents
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow users to update their own recents
CREATE POLICY "Users can update their own recents" ON public.recents
    FOR UPDATE
    USING (true);

-- Create policy to allow users to delete their own recents
CREATE POLICY "Users can delete their own recents" ON public.recents
    FOR DELETE
    USING (true);

-- Add comment
COMMENT ON TABLE public.recents IS 'Stores recently used drinks for each user'; 