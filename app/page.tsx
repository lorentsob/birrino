"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import SetupScreen from "@/components/SetupScreen";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Check Supabase configuration first
    if (!isSupabaseConfigured()) {
      setConfigError(
        "Supabase configuration is missing. Please check your environment variables."
      );
      setLoading(false);
      return;
    }

    const checkSessionAndProfile = async () => {
      try {
        // Get or create session
        let {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Create anonymous session
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Failed to create anonymous session:", error);
            setNeedsSetup(true);
            setLoading(false);
            return;
          }
          // Get the new session
          const result = await supabase.auth.getSession();
          session = result.data.session;
        }

        if (!session?.user?.id) {
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Check for existing profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          // No profile exists - show setup screen
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Profile exists - auto-redirect to dashboard
        router.replace("/dashboard");
      } catch (error) {
        console.error("Error checking session/profile:", error);
        setNeedsSetup(true);
        setLoading(false);
      }
    };

    checkSessionAndProfile();
  }, [router]);

  // Show config error
  if (configError) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Errore di configurazione</p>
          <p className="text-sm">{configError}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-gray-500 text-lg">
            Caricamento...
          </div>
        </div>
      </div>
    );
  }

  // Show setup screen if needed
  if (needsSetup) {
    return <SetupScreen />;
  }

  // This shouldn't be reached, but just in case
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-gray-500">Reindirizzamento...</div>
    </div>
  );
}
