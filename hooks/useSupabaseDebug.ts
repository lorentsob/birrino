import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export function useSupabaseDebug() {
  useEffect(() => {
    async function checkConnection() {
      // Check if environment variables are set
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const urlConfigured = !!supabaseUrl;
      const keyConfigured = !!supabaseKey;

      console.group("🔍 Supabase Connection Status");
      console.log("URL Configured:", urlConfigured ? "✅ Yes" : "❌ No");
      console.log("API Key Configured:", keyConfigured ? "✅ Yes" : "❌ No");

      if (!urlConfigured || !keyConfigured) {
        console.warn("⚠️ Configuration Missing");
        console.info(
          "To fix this issue, create a .env.local file in the project root with the following:"
        );
        console.info(`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
        `);
        console.info(
          "You can get these values from your Supabase project settings."
        );
      } else {
        try {
          // Try to make a simple query to test connection
          const { error } = await supabase
            .from("profiles")
            .select("count", { count: "exact" })
            .limit(0);

          if (error) {
            console.error(
              "❌ Connection Error:",
              error.message || JSON.stringify(error)
            );
            console.warn("⚠️ Connection Issue");
            console.info(
              "Configuration exists but connection failed. Check that:"
            );
            console.info("- Your Supabase URL and API key are correct");
            console.info("- Your Supabase project is running");
            console.info("- The required tables exist in your database");
          } else {
            console.log("✅ Connection Status: Connected successfully");
          }
        } catch (err: unknown) {
          console.error("❌ Exception:", getErrorMessage(err));
        }
      }

      console.groupEnd();
    }

    checkConnection();
  }, []);
}
