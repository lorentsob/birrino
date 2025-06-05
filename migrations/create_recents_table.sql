-- Create the recents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recents (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    drink_id uuid NOT NULL REFERENCES public.drinks(id) ON DELETE CASCADE,
    last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, drink_id)
);

-- Enable Row Level Security
ALTER TABLE public.recents ENABLE ROW LEVEL SECURITY;

-- Single policy covering all operations for the owner
CREATE POLICY "Users manage their recents" ON public.recents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.recents IS 'Stores recently used drinks for each user'; 