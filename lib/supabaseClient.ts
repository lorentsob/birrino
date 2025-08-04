// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// 🌐 Client pubblico (browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// 🔐 Client server-side (service role, solo per API route)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = serviceKey
  ? createClient<Database>(supabaseUrl!, serviceKey)
  : null;

// ✅ Verifica configurazione client pubblico
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
