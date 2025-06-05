import { supabase } from "@/lib/supabaseClient";

export async function resetApp() {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return;

  await supabase.from("consumption").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.auth.signOut();
  localStorage.clear();
  window.location.href = "/";
}
