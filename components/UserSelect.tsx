"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  display_name: string;
};

export default function UserSelect() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const router = useRouter();

  // Initialize anonymous session
  useEffect(() => {
    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          await supabase.auth.signInAnonymously();
        }
      } catch (error) {
        console.error("Error initializing anonymous session:", error);
      }
    }

    initSession();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("display_name");

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Check username availability with debounce
  useEffect(() => {
    const trimmedUsername = newUser.trim();

    // Reset availability state when input changes
    setUsernameAvailable(null);

    if (!trimmedUsername) return;

    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        // Case insensitive search
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name");

        if (error) throw error;

        // Manual case-insensitive comparison
        const isDuplicate = data.some(
          (user) =>
            user.display_name.toLowerCase() === trimmedUsername.toLowerCase()
        );

        setUsernameAvailable(!isDuplicate);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [newUser]);

  // Function to apply sentence case to username
  const applySentenceCase = (name: string): string => {
    if (!name) return "";
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSelectUser = (userId: string, displayName: string) => {
    // Store the user ID in localStorage for future reference
    localStorage.setItem("currentUserId", userId);
    localStorage.setItem("currentUserName", displayName);
    router.push(`/dashboard`);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = newUser.trim();
    if (!trimmedUsername) return;

    // Check availability one more time before submitting
    if (!usernameAvailable) {
      alert("Questo username è già in uso. Scegli un altro nome.");
      return;
    }

    // Apply sentence case to username
    const formattedUsername = applySentenceCase(trimmedUsername);

    try {
      setAdding(true);

      // First ensure we have an anonymous session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;
      }

      // Get the user ID from the session
      const { data: refreshedSession } = await supabase.auth.getSession();
      const userId = refreshedSession.session?.user?.id;

      if (!userId) {
        throw new Error("Failed to create or get user session");
      }

      // First do a case-insensitive check to prevent duplicates
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("display_name");

      if (checkError) throw checkError;

      // Check if any existing username matches case-insensitively
      const isDuplicate = existingUsers.some(
        (user) =>
          user.display_name.toLowerCase() === trimmedUsername.toLowerCase()
      );

      // If username exists (case insensitive), throw error
      if (isDuplicate) {
        throw new Error("duplicate_username");
      }

      // If no duplicate, proceed with insert
      const { data, error } = await supabase
        .from("profiles")
        .insert({ id: userId, display_name: formattedUsername })
        .select();

      if (error) {
        // Handle database constraint errors (duplicate username)
        if (error.code === "23505") {
          throw new Error("duplicate_username");
        }
        throw error;
      }

      if (data?.[0]) {
        setUsers([...users, data[0]]);
        handleSelectUser(data[0].id, data[0].display_name);
      }
    } catch (error: any) {
      console.error("Error adding user:", error);

      // Handle specific error for duplicate username
      if (error.message === "duplicate_username" || error.code === "23505") {
        // Update UI state to reflect username is taken
        setUsernameAvailable(false);
        alert("Username già in uso. Prova con un altro.");
      } else {
        alert("Errore durante l'aggiunta dell'utente. Riprova.");
      }
    } finally {
      setAdding(false);
    }
  };

  // Get username feedback message and color
  const getUsernameFeedback = () => {
    if (!newUser.trim()) return null;

    if (checking) {
      return {
        message: "Verifico disponibilità...",
        color: "text-gray-500",
      };
    }

    if (usernameAvailable === true) {
      return { message: "Ottima scelta!", color: "text-green-600" };
    }

    if (usernameAvailable === false) {
      return {
        message: "Ops! Username già in uso, provano un altro",
        color: "text-red-600",
      };
    }

    return null;
  };

  const feedback = getUsernameFeedback();

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
        <p className="text-lg mx-3 font-medium text-center text-primary-500  tracking-wide">
          Quanti. Non come o perchè.
        </p>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Scegli utente
        </h2>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-gray-500">
              Caricamento utenti...
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id, user.display_name)}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex items-center"
              >
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                  {user.display_name.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-800">{user.display_name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-2">
            Nessun utente trovato. Aggiungi il tuo primo utente qui sotto.
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Come ti posso chiamare?
        </h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="" className="label">
                Username
              </label>
              {feedback && (
                <p className={`text-sm ${feedback.color}`}>
                  {feedback.message}
                </p>
              )}
            </div>
            <input
              type="text"
              id="username"
              className="input"
              placeholder="Inserisci un username"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              required
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={adding || checking || usernameAvailable === false}
          >
            {adding ? "Aggiunta in corso..." : "Inizia"}
          </button>
        </form>
      </div>
    </div>
  );
}
