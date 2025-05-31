import { supabase } from "../lib/supabaseClient";

export default async function Test() {
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .in("category", ["Birra", "Vino", "Cocktail", "Superalcolici"]);

  return { data, error };
}
