import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites from Supabase
  useEffect(() => {
    async function fetchFavorites() {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("drink_id")
          .eq("user_id", userId);

        if (error) throw error;

        // Extract drink_ids from the results
        const favoriteIds = data ? data.map((item) => item.drink_id) : [];
        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  // Toggle favorite status
  const toggleFavorite = async (drinkId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) return;

    try {
      // Check if it's already a favorite
      const isFavorite = favorites.includes(drinkId);

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("drink_id", drinkId);

        // Update local state
        setFavorites(favorites.filter((id) => id !== drinkId));
      } else {
        // Add to favorites
        await supabase.from("favorites").insert({
          user_id: userId,
          drink_id: drinkId,
        });

        // Update local state
        setFavorites([...favorites, drinkId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return { favorites, toggleFavorite, loading };
}
