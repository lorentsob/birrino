"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CheckCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);

    // Fetch raw data to see actual categories in the database
    const { data, error } = await supabase
      .from("drinks")
      .select("id, name, type, category");

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  async function updateCategories() {
    setUpdating(true);
    setMessage("");

    try {
      // Aggiorna le categorie in base al tipo
      for (const drink of categories) {
        let newCategory = "";
        const type = (drink.type || "").toLowerCase();

        if (type.includes("vino") || type.includes("wine")) {
          newCategory = "Vino";
        } else if (type.includes("birra") || type.includes("beer")) {
          newCategory = "Birra";
        } else if (type.includes("cocktail")) {
          newCategory = "Cocktail";
        } else if (
          type.includes("spirit") ||
          type.includes("superalcolici") ||
          type.includes("liquor")
        ) {
          newCategory = "Superalcolici";
        } else {
          newCategory = "Birra"; // Default
        }

        // Aggiorna solo se la categoria è cambiata
        if (drink.category !== newCategory) {
          const { error } = await supabase
            .from("drinks")
            .update({ category: newCategory })
            .eq("id", drink.id);

          if (error) {
            console.error(`Error updating drink ${drink.name}:`, error);
          }
        }
      }

      // Ricarica i dati
      await fetchCategories();
      setMessage("Categorie aggiornate con successo!");
    } catch (error) {
      console.error("Error updating categories:", error);
      setMessage("Errore durante l'aggiornamento delle categorie.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Categorie dei Drink nel Database
      </h1>

      <div className="mb-6">
        <button
          onClick={updateCategories}
          disabled={updating || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {updating
            ? "Aggiornamento in corso..."
            : "Aggiorna tutte le categorie"}
        </button>

        {message && (
          <p
            className={`mt-2 ${
              message.includes("successo") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {loading ? (
        <p>Caricamento in corso...</p>
      ) : (
        <div>
          <p className="mb-4">
            Trovati {categories.length} drink nel database.
          </p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Nome</th>
                <th className="border p-2 text-left">Tipo (type)</th>
                <th className="border p-2 text-left">Categoria (category)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((drink) => (
                <tr key={drink.id} className="border-b">
                  <td className="border p-2">{drink.name}</td>
                  <td className="border p-2">{drink.type}</td>
                  <td className="border p-2">{drink.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
