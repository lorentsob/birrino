/**
 * Profile service for managing user profiles with PIN authentication
 */

import { supabase } from "./supabaseClient";
import { hashPin } from "./pinUtils";

export interface Profile {
  id: string;
  display_name: string;
  pin_hash?: string | null;
}

/**
 * Create a new profile for the current session with a PIN
 * @param displayName The user's display name
 * @param pin The user's 4-digit PIN
 * @returns The created profile or an error
 */
export async function createProfileWithPin(
  displayName: string,
  pin: string
): Promise<{
  profile: Profile | null;
  error: Error | null;
}> {
  try {
    // Ensure we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return { profile: null, error: new Error("No active session") };
    }

    // Hash the PIN client-side before sending
    const pinHash = await hashPin(pin);

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        display_name: displayName,
        pin_hash: pinHash,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate username
      if (error.code === "23505") {
        return {
          profile: null,
          error: new Error("Username già in uso. Scegli un altro nome."),
        };
      }
      return { profile: null, error: new Error(error.message) };
    }

    return { profile: data as Profile, error: null };
  } catch (err) {
    return {
      profile: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Login with username and PIN, migrating data to current session
 * @param username The display name
 * @param pin The 4-digit PIN
 * @returns Success status and profile info
 */
export async function loginWithUsernamePin(
  username: string,
  pin: string
): Promise<{
  success: boolean;
  displayName: string | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        displayName: null,
        error: "No active session",
      };
    }

    // Hash the PIN client-side
    const pinHash = await hashPin(pin);

    // Find profile with matching username and PIN hash
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("id, display_name, pin_hash")
      .ilike("display_name", username.trim())
      .single();

    if (findError || !existingProfile) {
      return {
        success: false,
        displayName: null,
        error: "Username non trovato.",
      };
    }

    // Verify PIN hash matches
    if (existingProfile.pin_hash !== pinHash) {
      return {
        success: false,
        displayName: null,
        error: "PIN non corretto.",
      };
    }

    // If we're already the owner of this profile, just return success
    if (existingProfile.id === session.user.id) {
      return {
        success: true,
        displayName: existingProfile.display_name,
        error: null,
      };
    }

    const oldUserId = existingProfile.id;
    const newUserId = session.user.id;

    // Migrate all data from old user to new user
    // 1. Update consumption records
    await supabase
      .from("consumption")
      .update({ user_id: newUserId })
      .eq("user_id", oldUserId);

    // 2. Update favorites
    await supabase
      .from("favorites")
      .update({ user_id: newUserId })
      .eq("user_id", oldUserId);

    // 3. Update recents
    await supabase
      .from("recents")
      .update({ user_id: newUserId })
      .eq("user_id", oldUserId);

    // 4. Update the profile's ID to the new user
    // First delete the old profile, then insert new one with same data
    const displayName = existingProfile.display_name;

    await supabase.from("profiles").delete().eq("id", oldUserId);

    await supabase.from("profiles").insert({
      id: newUserId,
      display_name: displayName,
      pin_hash: pinHash,
    });

    return {
      success: true,
      displayName,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      displayName: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get the current user's profile
 * @returns The profile or null if not found
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, pin_hash")
      .eq("id", session.user.id)
      .single();

    if (error || !data) return null;

    return data as Profile;
  } catch {
    return null;
  }
}

/**
 * Check if a username is available (case-insensitive)
 * First tries to use a database function to bypass RLS,
 * then falls back to a direct query if the function doesn't exist
 * @param username The username to check
 * @returns true if available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const trimmedName = username.trim().toLowerCase();
  
  if (!trimmedName) {
    return false;
  }

  try {
    // First try the RPC function (bypasses RLS)
    const { data: rpcData, error: rpcError } = await supabase.rpc("check_username_available", {
      username: trimmedName,
    });

    // If RPC works, use its result
    if (!rpcError) {
      return rpcData === true;
    }

    // Log the RPC error for debugging
    console.warn("RPC check_username_available not available, using fallback query:", rpcError.message);

    // Fallback: query the profiles table directly (case-insensitive)
    const { data: existingProfile, error: queryError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", trimmedName)
      .maybeSingle();

    if (queryError) {
      console.error("Error checking username availability:", queryError);
      // On query error, assume NOT available to be safe
      return false;
    }

    // If no profile found with this name, it's available
    return existingProfile === null;
  } catch (err) {
    console.error("Error checking username:", err);
    // On unexpected error, assume NOT available to be safe
    return false;
  }
}

/**
 * Apply sentence case to a name
 * @param name The name to format
 * @returns Formatted name
 */
export function formatDisplayName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
