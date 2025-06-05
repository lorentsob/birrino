import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

interface RecentsState {
  recents: string[];
  loading: boolean;
  userId: string | null;
  initialized: boolean;
  fetchRecents: () => Promise<void>;
  addRecent: (drinkId: string) => Promise<void>;
}

const useRecentsStore = create<RecentsState>((set, get) => ({
  recents: [],
  loading: false,
  userId: null,
  initialized: false,
  fetchRecents: async () => {
    if (get().initialized) return;
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id || null;
    if (!userId) {
      set({ userId: null, recents: [], initialized: true, loading: false });
      return;
    }
    set({ userId });
    try {
      const { data: recentsData, error } = await supabase
        .from("recents")
        .select("drink_id")
        .eq("user_id", userId)
        .order("last_used", { ascending: false })
        .limit(5);
      if (!error) {
        const ids = recentsData ? recentsData.map((r) => r.drink_id) : [];
        set({ recents: ids });
      }
    } catch (err) {
      console.error("Error fetching recents:", err);
    } finally {
      set({ loading: false, initialized: true });
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
        { onConflict: "user_id,drink_id" }
      );
      set({ recents: [drinkId, ...recents.filter((id) => id !== drinkId)] });
    } catch (err) {
      console.error("Error adding recent:", err);
    }
  },
}));

export function useRecents() {
  const { fetchRecents, initialized, ...rest } = useRecentsStore();
  useEffect(() => {
    if (!initialized) {
      fetchRecents();
    }
  }, [initialized, fetchRecents]);
  return rest;
}
