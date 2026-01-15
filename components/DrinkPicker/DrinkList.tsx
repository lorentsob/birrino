"use client";

import { Drink } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";
import { useFavorites } from "./hooks/useFavorites";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRecents } from "./hooks/useRecents";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface DrinkListProps {
  drinks: Drink[];
  onDrinkSelect: (drink: Drink) => void;
  onDrinkAdded: () => void;
  query: string;
}

export function DrinkList({
  drinks,
  onDrinkSelect,
  onDrinkAdded,
  query,
}: DrinkListProps) {
  const { favorites, toggleFavorite, error: favoritesError } = useFavorites();
  const { addRecent } = useRecents();
  const [addingDrink, setAddingDrink] = useState<string | null>(null);

  const categoryLabels: Record<string, string> = {
    Birra: "Birra",
    Vino: "Vino",
    Cocktail: "Cocktail",
    Superalcolici: "Superalcolici",
  };

  const categoryClasses: Record<string, string> = {
    Birra: "bg-amber-50 text-amber-700 border-amber-200",
    Vino: "bg-rose-50 text-rose-700 border-rose-200",
    Cocktail: "bg-teal-50 text-teal-700 border-teal-200",
    Superalcolici: "bg-purple-50 text-purple-700 border-purple-200",
  };

  // Show error toast if there's a favorites error and it's not a "table doesn't exist" error
  if (
    favoritesError &&
    !favoritesError.includes("relation") &&
    !favoritesError.includes("does not exist")
  ) {
    toast.error(`Error: ${favoritesError}`);
  }

  const handleQuickAdd = async (
    drink: Drink,
    quantity: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setAddingDrink(drink.id);

    // Add haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        toast.error("No active session found");
        return;
      }

      // Insert consumption record with user_id
      const { error } = await supabase.from("consumption").insert({
        drink_id: drink.id,
        quantity,
        units: drink.units * quantity,
        timestamp: new Date().toISOString(),
        user_id: userId,
      });

      if (error) {
        toast.error(`Error adding drink: ${error.message}`);
      } else {
        addRecent(drink.id);
        onDrinkAdded();
      }
    } catch (err) {
      toast.error("Failed to add drink");
      console.error("Error adding drink:", err);
    } finally {
      setAddingDrink(null);
    }
  };

  const handleToggleFavorite = (drinkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(drinkId);
  };

  return (
    <div className="h-[calc(60vh-150px)] max-h-[450px] overflow-auto pb-6 overscroll-contain space-y-3">
      {drinks.map((drink) => {
        const isFavorite = favorites.includes(drink.id);
        const isAdding = addingDrink === drink.id;

        return (
          <Card
            key={drink.id}
            className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <CardContent className="p-0">
              {/* Main drink info - clickable for custom quantity */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors duration-150"
                onClick={() => onDrinkSelect(drink)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 truncate leading-tight">
                        {drink.name}
                      </h3>
                      <button
                        onClick={(e) => handleToggleFavorite(drink.id, e)}
                        className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors duration-150 flex-shrink-0"
                        aria-label={
                          isFavorite
                            ? "Rimuovi dai preferiti"
                            : "Aggiungi ai preferiti"
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400 hover:text-gray-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border",
                          categoryClasses[drink.category] ??
                            "bg-gray-50 text-gray-700 border-gray-200"
                        )}
                      >
                        {categoryLabels[drink.category] ??
                          (typeof drink.category === "string"
                            ? drink.category
                            : "Altro")}
                      </span>
                      <div className="text-sm text-gray-600 font-medium">
                        {drink.units.toFixed(1)} u
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick add buttons with improved spacing */}
              <div className="px-5 pb-5">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-12 bg-red-400 hover:bg-red-500 text-white font-medium rounded-xl border-0 shadow-sm transition-all duration-200 hover:shadow-md"
                    disabled={isAdding}
                    onClick={(e) => handleQuickAdd(drink, 1, e)}
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Aggiungendo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Aggiungi 1</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-6 h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:border-gray-300"
                    disabled={isAdding}
                    onClick={() => onDrinkSelect(drink)}
                  >
                    Altro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {drinks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Nessuna bevanda trovata
          </p>
          {query && (
            <p className="text-gray-500">
              Prova con un termine di ricerca diverso
            </p>
          )}
        </div>
      )}
    </div>
  );
}
