import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAnonSession() {
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          await supabase.auth.signInAnonymously();
        }
      } catch (error) {
        console.error("Error initializing anonymous session:", error);
      }
    };

    initSession();
  }, []);
}
