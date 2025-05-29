"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  name: string;
};

export default function UserSelect() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("name");

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

  const handleSelectUser = (name: string) => {
    router.push(`/${encodeURIComponent(name)}`);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim()) return;

    try {
      setAdding(true);
      const { data, error } = await supabase
        .from("users")
        .insert({ name: newUser.trim() })
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setUsers([...users, data[0]]);
        router.push(`/${encodeURIComponent(data[0].name)}`);
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (error.code === "23505") {
        alert("This username already exists. Please choose another name.");
      } else {
        alert("Failed to add user. Please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">5° Birrino</h1>
        <p className="text-lg mx-3 font-medium text-center text-black-500  tracking-wide">
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
                onClick={() => handleSelectUser(user.name)}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex items-center"
              >
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-800">{user.name}</span>
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
          Aggiungi nuovo utente
        </h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="input"
              placeholder="Enter your name"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              required
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={adding}
          >
            {adding ? "Adding..." : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
