/**
 * Profile service — username + PIN auth via Supabase Auth.
 * The PIN is used as the password against a synthetic email (username@birrino.local).
 * Supabase handles all hashing (bcrypt) and rate limiting server-side.
 * No personal data is ever stored.
 */

import { supabase } from "./supabaseClient";

export interface Profile {
  id: string;
  display_name: string;
}

/** Build synthetic email from username — never shown to the user */
const toEmail = (username: string) =>
  `${username.toLowerCase().trim()}@birrino.local`;

/**
 * Sign up with a new username + PIN.
 * Creates a Supabase Auth user and a matching profile row.
 */
export async function signUpWithUsernamePin(
  displayName: string,
  pin: string
): Promise<{ profile: Profile | null; error: Error | null }> {
  try {
    const formatted = formatDisplayName(displayName);
    const email = toEmail(displayName);

    // 1. Create the Supabase Auth user — bcrypt hashing happens server-side
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: pin,
    });

    if (signUpError) {
      if (
        signUpError.message.toLowerCase().includes("already") ||
        signUpError.message.toLowerCase().includes("registered")
      ) {
        return {
          profile: null,
          error: new Error("Username già in uso. Scegli un altro nome."),
        };
      }
      return { profile: null, error: new Error(signUpError.message) };
    }

    if (!data.user) {
      return { profile: null, error: new Error("Registrazione fallita.") };
    }

    // 2. Create the profile row linked to the new auth user
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, display_name: formatted })
      .select("id, display_name")
      .single();

    if (profileError) {
      return { profile: null, error: new Error(profileError.message) };
    }

    return { profile: profileData as Profile, error: null };
  } catch (err) {
    return {
      profile: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Sign in with an existing username + PIN.
 * Supabase Auth verifies the bcrypt hash server-side.
 */
export async function signInWithUsernamePin(
  username: string,
  pin: string
): Promise<{ success: boolean; displayName: string | null; error: string | null }> {
  try {
    const email = toEmail(username);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (signInError) {
      // Supabase returns "Invalid login credentials" for both wrong username and wrong PIN
      return {
        success: false,
        displayName: null,
        error: "Username o PIN non corretti.",
      };
    }

    if (!data.user) {
      return { success: false, displayName: null, error: "Accesso fallito." };
    }

    // Fetch display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .single();

    return {
      success: true,
      displayName: profile?.display_name ?? formatDisplayName(username),
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
 * Get the current authenticated user's profile.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", session.user.id)
      .single();

    if (error || !data) return null;

    return data as Profile;
  } catch {
    return null;
  }
}

/**
 * Check if a username is available (case-insensitive).
 * Checks the profiles table by display_name.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed) return false;

  try {
    // Try the RPC function first (bypasses RLS)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "check_username_available",
      { username: trimmed }
    );

    if (!rpcError) return rpcData === true;

    console.warn("RPC not available, using fallback:", rpcError.message);

    const { data: existing, error: queryError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", trimmed)
      .maybeSingle();

    if (queryError) return false;
    return existing === null;
  } catch {
    return false;
  }
}

/**
 * Apply sentence case to a display name.
 */
export function formatDisplayName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
