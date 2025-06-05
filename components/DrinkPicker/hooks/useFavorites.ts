import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

interface FavoritesState {
  favorites: string[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (drinkId: string) => Promise<void>;
}

const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  initialized: false,
  fetchFavorites: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        set({ favorites: [], initialized: true, loading: false });
        return;
      }
      const { data, error } = await supabase
        .from("favorites")
        .select("drink_id")
        .eq("user_id", userId);
      if (error) {
        if (
          error.message.includes("relation") &&
          error.message.includes("does not exist")
        ) {
          set({ favorites: [], error: null });
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      } else {
        const ids = data ? data.map((d) => d.drink_id) : [];
        set({ favorites: ids, error: null });
      }
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Unknown error fetching favorites",
        favorites: [],
      });
    } finally {
      set({ loading: false, initialized: true });
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
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const isFavorite = favorites.includes(drinkId);
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("drink_id", drinkId);
        if (error) {
          if (
            error.message.includes("relation") &&
            error.message.includes("does not exist")
          ) {
            return;
          }
          throw new Error(`Error removing favorite: ${error.message}`);
        }
        set({ favorites: favorites.filter((id) => id !== drinkId) });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          drink_id: drinkId,
        });
        if (error) {
          if (
            error.message.includes("relation") &&
            error.message.includes("does not exist")
          ) {
            return;
          }
          throw new Error(`Error adding favorite: ${error.message}`);
        }
        set({ favorites: [...favorites, drinkId] });
      }
      set({ error: null });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Unknown error toggling favorite",
      });
    }
  },
}));

export function useFavorites() {
  const { fetchFavorites, initialized, ...rest } = useFavoritesStore();
  useEffect(() => {
    if (!initialized) {
      fetchFavorites();
    }
  }, [initialized, fetchFavorites]);
  return rest;
}
