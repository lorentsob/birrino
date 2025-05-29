import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentsStore {
  recents: string[];
  addRecent: (drinkId: string) => void;
}

export const useRecents = create<RecentsStore>()(
  persist(
    (set) => ({
      recents: [],
      addRecent: (drinkId) =>
        set((state) => ({
          recents: [drinkId, ...state.recents.slice(0, 4)],
        })),
    }),
    {
      name: "recent-drinks-v1",
    }
  )
);
