import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verify configuration
if (!supabaseUrl) {
  console.error(
    "Missing Supabase URL. Make sure NEXT_PUBLIC_SUPABASE_URL is set in your environment variables."
  );
}

if (!supabaseAnonKey) {
  console.error(
    "Missing Supabase Anon Key. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is set in your environment variables."
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder-url.supabase.co", // Prevent runtime errors
  supabaseAnonKey || "placeholder-key" // Prevent runtime errors
);

// Export helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
