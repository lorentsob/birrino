/**
 * Kept for backward compatibility — no longer creates anonymous sessions.
 * Auth is now handled by Supabase Auth (signUp / signInWithPassword).
 */
export function useAnonSession() {
  // no-op
}
