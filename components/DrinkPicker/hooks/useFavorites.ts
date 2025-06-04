import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchFavorites() {
      try {
        // Check if user is authenticated
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }

        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          // User is not authenticated, so we don't need to fetch favorites
          if (isMounted) {
            setLoading(false);
            setFavorites([]);
          }
          return;
        }

        // Fetch favorites
        const { data, error: favoritesError } = await supabase
          .from("favorites")
          .select("drink_id")
          .eq("user_id", userId);

        if (favoritesError) {
          throw new Error(`Database error: ${favoritesError.message}`);
        }

        // Extract drink_ids from the results
        const favoriteIds = data ? data.map((item) => item.drink_id) : [];

        if (isMounted) {
          setFavorites(favoriteIds);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unknown error fetching favorites"
          );
          setFavorites([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle favorite status
  const toggleFavorite = async (drinkId: string) => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Check if it's already a favorite
      const isFavorite = favorites.includes(drinkId);

      if (isFavorite) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("drink_id", drinkId);

        if (deleteError) {
          throw new Error(`Error removing favorite: ${deleteError.message}`);
        }

        // Update local state
        setFavorites(favorites.filter((id) => id !== drinkId));
      } else {
        // Add to favorites
        const { error: insertError } = await supabase.from("favorites").insert({
          user_id: userId,
          drink_id: drinkId,
        });

        if (insertError) {
          throw new Error(`Error adding favorite: ${insertError.message}`);
        }

        // Update local state
        setFavorites([...favorites, drinkId]);
      }

      setError(null);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error toggling favorite"
      );
    }
  };

  return { favorites, toggleFavorite, loading, error };
}
