"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createProfile,
  recoverProfile,
  isUsernameAvailable,
  formatDisplayName,
} from "@/lib/profileService";
import { isValidRecoveryCode, formatRecoveryCode } from "@/lib/recoveryCode";

type Mode = "name" | "recovery";

export default function SetupScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("name");
  const [name, setName] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [recoveredName, setRecoveredName] = useState<string | null>(null);

  // Check username availability with debounce
  useEffect(() => {
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
  }, [name]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (usernameAvailable === false) {
      setError("Username già in uso. Scegli un altro nome.");
      return;
    }

    setLoading(true);
    setError(null);

    const formattedName = formatDisplayName(trimmedName);
    const { profile, error: createError } = await createProfile(formattedName);

    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    if (profile?.recovery_code) {
      setNewRecoveryCode(profile.recovery_code);
      setRecoveredName(profile.display_name);
    }
    setLoading(false);
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = recoveryCode.trim();

    if (!isValidRecoveryCode(code)) {
      setError("Formato codice non valido. Esempio: BEER-1234-WINE-5678");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await recoverProfile(code);

    if (!result.success) {
      setError(result.error || "Codice non trovato. Riprova.");
      setLoading(false);
      return;
    }

    setNewRecoveryCode(result.newRecoveryCode);
    setRecoveredName(result.displayName);
    setLoading(false);
  };

  const handleContinue = () => {
    router.replace("/dashboard");
  };

  // Get username feedback
  const getUsernameFeedback = () => {
    if (!name.trim()) return null;

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

  // Show recovery code success screen
  if (newRecoveryCode) {
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

          <h2 className="text-xl font-semibold mb-2">
            {recoveredName
              ? `Bentornato, ${recoveredName}!`
              : "Profilo creato!"}
          </h2>

          <p className="text-gray-600 mb-4">
            Salva questo codice per recuperare il tuo profilo su un nuovo
            dispositivo:
          </p>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <code className="text-xl font-mono font-bold text-primary-600 break-all">
              {newRecoveryCode}
            </code>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Fai uno screenshot o scrivi questo codice in un posto sicuro.
          </p>

          <button onClick={handleContinue} className="btn btn-primary w-full">
            Ho salvato il codice, continua
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
      </div>

      {mode === "name" ? (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Come ti posso chiamare?
          </h2>

          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="name" className="label">
                  Il tuo nome
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
                placeholder="Inserisci il tuo nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
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
                checking ||
                !name.trim() ||
                usernameAvailable === false
              }
            >
              {loading ? "Creazione..." : "Inizia"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                setMode("recovery");
                setError(null);
              }}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              Hai già un account? Usa il codice di recupero
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recupera il tuo profilo
          </h2>

          <p className="text-gray-600 text-sm mb-4">
            Inserisci il codice di recupero che hai salvato quando hai creato il
            tuo profilo.
          </p>

          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label htmlFor="recovery" className="label mb-1 block">
                Codice di recupero
              </label>
              <input
                type="text"
                id="recovery"
                className="input w-full font-mono text-center uppercase"
                placeholder="BEER-1234-WINE-5678"
                value={recoveryCode}
                onChange={(e) =>
                  setRecoveryCode(formatRecoveryCode(e.target.value))
                }
                disabled={loading}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || !recoveryCode.trim()}
            >
              {loading ? "Recupero in corso..." : "Recupera profilo"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                setMode("name");
                setError(null);
                setRecoveryCode("");
              }}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              Torna indietro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
