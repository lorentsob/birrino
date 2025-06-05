import { useState, useMemo, useEffect } from "react";
import { Drink, DrinkCategory } from "../types";
import { supabase } from "@/lib/supabaseClient";

interface DatabaseDrink {
  id: string;
  name: string;
  volume_ml: number;
  abv: number;
  type: string;
}

export function useDrinkPicker() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [category, setCategory] = useState<DrinkCategory | null>(null);
  const [query, setQuery] = useState("");

  // Fetch drinks on mount
  useEffect(() => {
    async function fetchDrinks() {
      const { data, error } = await supabase
        .from("drinks")
        .select("id, name, volume_ml, abv, type")
        .order("name");

      if (!error && data) {
        // Transform existing data to match DrinkPicker expectations
        const transformedDrinks = data.map((drink: DatabaseDrink) => {
          // Map the type from DB to a valid DrinkCategory
          let category: DrinkCategory;
          const type = (drink.type || "").toLowerCase();

          if (type.includes("vino") || type.includes("wine")) {
            category = "Vino";
          } else if (type.includes("birra") || type.includes("beer")) {
            category = "Birra";
          } else if (type.includes("cocktail")) {
            category = "Cocktail";
          } else if (
            type.includes("spirit") ||
            type.includes("superalcolici") ||
            type.includes("liquor")
          ) {
            category = "Superalcolici";
          } else {
            // Default category
            category = "Birra";
          }

          return {
            id: drink.id,
            name: drink.name,
            category: category, // Use mapped category
            abv: drink.abv,
            units: (drink.volume_ml * drink.abv) / 1000, // Calculate units
          };
        });
        setDrinks(transformedDrinks as Drink[]);
      }
    }

    fetchDrinks();
  }, []);

  // Filter drinks based on category and search query
  const filtered = useMemo(() => {
    return drinks
      .filter((drink) => {
        const matchesCategory = !category || drink.category === category;
        const matchesQuery =
          !query || drink.name.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        // Sort by category first, then by name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
  }, [drinks, category, query]);

  return {
    drinks,
    category,
    setCategory,
    query,
    setQuery,
    filtered,
  };
}
