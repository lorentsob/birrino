import { supabase } from "@/lib/supabaseClient";
import { getCurrentSessionUserId } from "@/lib/session";

interface AddConsumptionInput {
  drinkId: string;
  quantity: number;
  units: number;
  timestamp?: string;
}

interface AddConsumptionResult {
  success: boolean;
  error: string | null;
}

export async function addConsumptionRecord({
  drinkId,
  quantity,
  units,
  timestamp = new Date().toISOString(),
}: AddConsumptionInput): Promise<AddConsumptionResult> {
  const userId = await getCurrentSessionUserId();

  if (!userId) {
    return {
      success: false,
      error: "Sessione utente non disponibile.",
    };
  }

  const { error } = await supabase.from("consumption").insert({
    drink_id: drinkId,
    quantity,
    units,
    timestamp,
    user_id: userId,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}
