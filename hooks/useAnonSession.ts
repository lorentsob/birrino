import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAnonSession() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        supabase.auth.signInAnonymously();
      }
    });
  }, []);
}
