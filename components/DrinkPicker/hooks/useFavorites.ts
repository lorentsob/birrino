import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: string[];
  toggleFavorite: (drinkId: string) => void;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (drinkId) =>
        set((state) => ({
          favorites: state.favorites.includes(drinkId)
            ? state.favorites.filter((id) => id !== drinkId)
            : [...state.favorites, drinkId],
        })),
    }),
    {
      name: "favorite-drinks-v1",
    }
  )
);
