import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface FavoritesHookProps {
  userName: string;
}

export function useFavorites({ userName }: FavoritesHookProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites from Supabase
  useEffect(() => {
    async function fetchFavorites() {
      if (!userName) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("drink_id")
          .eq("user_id", userName);

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
  }, [userName]);

  // Toggle favorite status
  const toggleFavorite = async (drinkId: string) => {
    if (!userName) return;

    try {
      // Check if it's already a favorite
      const isFavorite = favorites.includes(drinkId);

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userName)
          .eq("drink_id", drinkId);

        // Update local state
        setFavorites(favorites.filter((id) => id !== drinkId));
      } else {
        // Add to favorites
        await supabase.from("favorites").insert({
          user_id: userName,
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
