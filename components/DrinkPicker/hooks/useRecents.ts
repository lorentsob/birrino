import { useEffect } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

interface RecentsState {
  recents: string[];
  loading: boolean;
  userId: string | null;
  fetchRecents: () => Promise<void>;
  addRecent: (drinkId: string) => Promise<void>;
}

const useRecentsStore = create<RecentsState>((set, get) => ({
  recents: [],
  loading: true,
  userId: null,
  fetchRecents: async () => {
    const { userId } = get();
    if (!userId) {
      set({ loading: false });
      return;
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("recents")
        .select("drink_id")
        .eq("user_id", userId)
        .order("last_used", { ascending: false })
        .limit(5);

      if (error) throw error;

      const recentIds = data ? data.map((item) => item.drink_id) : [];
      set({ recents: recentIds, loading: false });
    } catch (err) {
      console.error("Error fetching recents:", err);
      set({ loading: false });
    }
  },
  addRecent: async (drinkId: string) => {
    const { userId, recents } = get();
    if (!userId) return;

    try {
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

      const filtered = recents.filter((id) => id !== drinkId);
      set({ recents: [drinkId, ...filtered] });
    } catch (err) {
      console.error("Error adding recent:", err);
    }
  },
}));

export function useRecents() {
  const store = useRecentsStore();

  useEffect(() => {
    async function getUserSession() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        useRecentsStore.setState({ userId: data.session.user.id });
      } else {
        useRecentsStore.setState({ userId: null });
      }
    }

    getUserSession();
  }, [store]);

  useEffect(() => {
    if (store.userId) {
      store.fetchRecents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.userId]);

  return store;
}
