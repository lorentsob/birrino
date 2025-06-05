"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAnonSession } from "@/hooks/useAnonSession";

export default function ConsumptionInsertTest() {
  const [status, setStatus] = useState<string>("");
  const [insertResult, setInsertResult] = useState<any>(null);

  useAnonSession();

  async function testInsertDrink() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setStatus("No active session");
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
        setInsertResult(data);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Consumption Insert Test</h2>

      <div className="space-y-4">
        <div>
          <button
            onClick={testInsertDrink}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Test Insert Drink
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Status:</h3>
          <div className="p-2 bg-gray-100 rounded">{status}</div>
        </div>


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
