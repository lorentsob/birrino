import { useEffect } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

interface FavoritesState {
  favorites: string[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (drinkId: string) => Promise<void>;
}

const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: true,
  error: null,
  fetchFavorites: async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        set({ favorites: [], loading: false });
        return;
      }

      const { data, error: favoritesError } = await supabase
        .from("favorites")
        .select("drink_id")
        .eq("user_id", userId);

      if (favoritesError) {
        if (
          favoritesError.message.includes("relation") &&
          favoritesError.message.includes("does not exist")
        ) {
          set({ favorites: [], error: null, loading: false });
          return;
        }
        throw new Error(`Database error: ${favoritesError.message}`);
      }

      const favoriteIds = data ? data.map((item) => item.drink_id) : [];
      set({ favorites: favoriteIds, error: null, loading: false });
    } catch (err) {
      console.error("Error fetching favorites:", err);
      set({
        favorites: [],
        error:
          err instanceof Error ? err.message : "Unknown error fetching favorites",
        loading: false,
      });
    }
  },
  toggleFavorite: async (drinkId: string) => {
    const { favorites } = get();
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

      const isFavorite = favorites.includes(drinkId);

      if (isFavorite) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("drink_id", drinkId);

        if (deleteError) {
          if (
            deleteError.message.includes("relation") &&
            deleteError.message.includes("does not exist")
          ) {
            return;
          }
          throw new Error(`Error removing favorite: ${deleteError.message}`);
        }

        set({ favorites: favorites.filter((id) => id !== drinkId) });
      } else {
        const { error: insertError } = await supabase.from("favorites").insert({
          user_id: userId,
          drink_id: drinkId,
        });

        if (insertError) {
          if (
            insertError.message.includes("relation") &&
            insertError.message.includes("does not exist")
          ) {
            return;
          }
          throw new Error(`Error adding favorite: ${insertError.message}`);
        }

        set({ favorites: [...favorites, drinkId] });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      set({
        error:
          err instanceof Error ? err.message : "Unknown error toggling favorite",
      });
    }
  },
}));

export function useFavorites() {
  const store = useFavoritesStore();

  useEffect(() => {
    store.fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
