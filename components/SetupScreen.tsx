"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createProfileWithPin,
  loginWithUsernamePin,
  isUsernameAvailable,
  formatDisplayName,
} from "@/lib/profileService";
import { isValidPin, formatPinInput } from "@/lib/pinUtils";
import { Eye, EyeOff } from "lucide-react";

type Mode = "signup" | "login";

export default function SetupScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check username availability with debounce (only in signup mode)
  useEffect(() => {
    if (mode !== "signup") return;

    const trimmedName = name.trim();
    setUsernameAvailable(null);
    setError(null);

    if (!trimmedName) return;

    const timer = setTimeout(async () => {
      setChecking(true);
      const available = await isUsernameAvailable(trimmedName);
      setUsernameAvailable(available);
      setChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [name, mode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (!isValidPin(pin)) {
      setError("Il PIN deve essere di 4 cifre.");
      return;
    }

    if (usernameAvailable === false) {
      setError("Username già in uso. Scegli un altro nome.");
      return;
    }

    setLoading(true);
    setError(null);

    const formattedName = formatDisplayName(trimmedName);
    const { profile, error: createError } = await createProfileWithPin(
      formattedName,
      pin
    );

    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    if (profile) {
      setSuccess(`Benvenuto, ${profile.display_name}!`);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Inserisci il tuo username.");
      return;
    }

    if (!isValidPin(pin)) {
      setError("Il PIN deve essere di 4 cifre.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginWithUsernamePin(trimmedName, pin);

    if (!result.success) {
      setError(result.error || "Accesso fallito. Riprova.");
      setLoading(false);
      return;
    }

    setSuccess(`Bentornato, ${result.displayName}!`);
    setTimeout(() => {
      router.replace("/dashboard");
    }, 1500);
    setLoading(false);
  };

  // Get username feedback (signup mode only)
  const getUsernameFeedback = () => {
    if (mode !== "signup" || !name.trim()) return null;

    if (checking) {
      return { message: "Verifico disponibilità...", color: "text-gray-500" };
    }

    if (usernameAvailable === true) {
      return { message: "Ottima scelta!", color: "text-green-600" };
    }

    if (usernameAvailable === false) {
      return {
        message: "Username già in uso",
        color: "text-red-600",
      };
    }

    return null;
  };

  const feedback = getUsernameFeedback();

  // Show success screen
  if (success) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold mb-2">{success}</h2>

          <p className="text-gray-600 mb-4">Reindirizzamento in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {mode === "signup" ? "Crea il tuo profilo" : "Accedi al tuo profilo"}
        </h2>

        <form
          onSubmit={mode === "signup" ? handleSignup : handleLogin}
          className="space-y-4"
        >
          {/* Username field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="name" className="label">
                Username
              </label>
              {feedback && (
                <span className={`text-sm ${feedback.color}`}>
                  {feedback.message}
                </span>
              )}
            </div>
            <input
              type="text"
              id="name"
              className="input w-full"
              placeholder="Inserisci il tuo username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          {/* PIN field */}
          <div>
            <label htmlFor="pin" className="label mb-1 block">
              PIN (4 cifre)
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                id="pin"
                className="input w-full text-center text-xl tracking-[0.5em] font-mono pr-12"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(formatPinInput(e.target.value))}
                disabled={loading}
                required
                maxLength={4}
                inputMode="numeric"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPin ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {mode === "signup"
                ? "Scegli un PIN facile da ricordare"
                : "Inserisci il PIN del tuo profilo"}
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={
              loading ||
              (mode === "signup" && checking) ||
              !name.trim() ||
              !isValidPin(pin) ||
              (mode === "signup" && usernameAvailable === false)
            }
          >
            {loading
              ? mode === "signup"
                ? "Creazione..."
                : "Accesso..."
              : mode === "signup"
                ? "Crea profilo"
                : "Accedi"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError(null);
              setPin("");
            }}
            className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
          >
            {mode === "signup"
              ? "Hai già un account? Accedi"
              : "Non hai un account? Registrati"}
          </button>
        </div>
      </div>
    </div>
  );
}
