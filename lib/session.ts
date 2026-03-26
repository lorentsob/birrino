import { supabase } from "@/lib/supabaseClient";

export async function getCurrentSessionUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}
