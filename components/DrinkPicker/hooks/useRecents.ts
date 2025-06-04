import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useRecents() {
  const [recents, setRecents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user session
  useEffect(() => {
    async function getUserSession() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    }

    getUserSession();
  }, []);

  // Fetch recents from Supabase
  useEffect(() => {
    async function fetchRecents() {
      if (!userId) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("recents")
          .select("drink_id")
          .eq("user_id", userId)
          .order("last_used", { ascending: false })
          .limit(5);

        if (error) throw error;

        // Extract drink_ids from the results
        const recentIds = data ? data.map((item) => item.drink_id) : [];
        setRecents(recentIds);
      } catch (error) {
        console.error("Error fetching recents:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchRecents();
    }
  }, [userId]);

  // Add a drink to recents
  const addRecent = async (drinkId: string) => {
    if (!userId) return;

    try {
      // Upsert to recents table
      await supabase.from("recents").upsert(
        {
          user_id: userId,
          drink_id: drinkId,
          last_used: new Date().toISOString(),
        },
        {
          onConflict: "user_id,drink_id",
        }
      );

      // Update local state - move this drink to the front if it exists
      setRecents((prev) => {
        const filtered = prev.filter((id) => id !== drinkId);
        return [drinkId, ...filtered];
      });
    } catch (error) {
      console.error("Error adding recent:", error);
    }
  };

  return { recents, addRecent, loading };
}
