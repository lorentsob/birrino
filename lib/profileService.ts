/**
 * Profile service for managing user profiles with recovery codes
 */

import { supabase } from "./supabaseClient";
import { generateRecoveryCode } from "./recoveryCode";

export interface Profile {
  id: string;
  display_name: string;
  recovery_code: string | null;
}

/**
 * Create a new profile for the current session with a recovery code
 * @param displayName The user's display name
 * @returns The created profile or an error
 */
export async function createProfile(displayName: string): Promise<{
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

    const recoveryCode = generateRecoveryCode();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        display_name: displayName,
        recovery_code: recoveryCode,
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
      .select("id, display_name, recovery_code")
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

/**
 * Recover a profile using a recovery code
 * This migrates all user data to the current session
 * @param recoveryCode The recovery code
 * @returns Success status and new recovery code
 */
export async function recoverProfile(recoveryCode: string): Promise<{
  success: boolean;
  newRecoveryCode: string | null;
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
        newRecoveryCode: null,
        displayName: null,
        error: "No active session",
      };
    }

    // Call the Edge Function to handle recovery
    const { data, error } = await supabase.functions.invoke("recover-profile", {
      body: { recovery_code: recoveryCode.toUpperCase().trim() },
    });

    if (error) {
      return {
        success: false,
        newRecoveryCode: null,
        displayName: null,
        error: error.message || "Recovery failed",
      };
    }

    return {
      success: true,
      newRecoveryCode: data.new_recovery_code,
      displayName: data.display_name,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      newRecoveryCode: null,
      displayName: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
