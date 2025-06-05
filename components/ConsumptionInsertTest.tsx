"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface ConsumptionRecord {
  id: string;
  drink_id: string;
  quantity: number;
  units: number;
  timestamp: string;
  user_id: string;
}

export default function ConsumptionInsertTest() {
  const [status, setStatus] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState<User | null>(null);
  const [insertResult, setInsertResult] = useState<ConsumptionRecord[] | null>(
    null
  );

  async function ensureAnonymousSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setStatus("No session found. Creating anonymous session...");
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Failed to sign in anonymously", error);
        setStatus(`Error signing in: ${error.message}`);
        throw error;
      }
      setStatus("Anonymous session created successfully");
    } else {
      setStatus("Session already exists");
    }

    // Get and display current session
    const { data } = await supabase.auth.getSession();
    setSessionInfo(data.session?.user ?? null);
    return data.session;
  }

  async function testInsertDrink() {
    try {
      const session = await ensureAnonymousSession();

      if (!session) {
        setStatus("Failed to create or get session");
        return;
      }

      setStatus("Inserting drink into consumption table...");

      const { error, data } = await supabase
        .from("consumption")
        .insert({
          drink_id: "ae4a4797-eecd-4343-8694-e9beca87b222", // use a valid existing drink_id
          quantity: 1,
          units: 2.5,
        })
        .select();

      if (error) {
        console.error("❌ Insert failed:", error);
        setStatus(`Insert failed: ${error.message}`);
        setInsertResult(null);
      } else {
        console.log("✅ Insert succeeded:", data);
        setStatus("Insert succeeded!");
        setInsertResult(data as ConsumptionRecord[]);
      }
    } catch (error) {
      const err = error as Error;
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Consumption Insert Test</h2>

      <div className="space-y-4">
        <div>
          <button
            onClick={ensureAnonymousSession}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            1. Check/Create Anonymous Session
          </button>
        </div>

        <div>
          <button
            onClick={testInsertDrink}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            2. Test Insert Drink
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Status:</h3>
          <div className="p-2 bg-gray-100 rounded">{status}</div>
        </div>

        {sessionInfo && (
          <div className="mt-4">
            <h3 className="font-semibold">Session Info:</h3>
            <pre className="p-2 bg-gray-100 rounded overflow-x-auto text-xs">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        {insertResult && (
          <div className="mt-4">
            <h3 className="font-semibold">Insert Result:</h3>
            <pre className="p-2 bg-gray-100 rounded overflow-x-auto text-xs">
              {JSON.stringify(insertResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
