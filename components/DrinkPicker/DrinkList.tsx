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
    Birra: "bg-amber-100 text-amber-800",
    Vino: "bg-rose-100 text-rose-800",
    Cocktail: "bg-teal-100 text-teal-800",
    Superalcolici: "bg-purple-100 text-purple-800",
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

      // Insert consumption record - user_id will be filled automatically by the database trigger
      const { error } = await supabase.from("consumption").insert({
        drink_id: drink.id,
        quantity,
        units: drink.units * quantity,
        timestamp: new Date().toISOString(),
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
    <div className="h-[calc(60vh-150px)] max-h-[450px] overflow-auto pb-4 overscroll-contain space-y-3 px-1 sm:px-0">
      {drinks.map((drink) => {
        const isFavorite = favorites.includes(drink.id);
        const isAdding = addingDrink === drink.id;

        return (
          <Card
            key={drink.id}
            className="mx-1 sm:mx-0 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <CardContent className="p-0">
              {/* Main drink info - clickable for custom quantity */}
              <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                onClick={() => onDrinkSelect(drink)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base mb-1 truncate text-gray-800">
                      {drink.name}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded font-medium",
                          categoryClasses[drink.category] ??
                            "bg-gray-100 text-gray-600"
                        )}
                      >
                        {categoryLabels[drink.category] ??
                          (typeof drink.category === "string"
                            ? drink.category
                            : "Altro")}
                      </span>
                      <span>•</span>
                      <span>{drink.units.toFixed(1)} u</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(drink.id, e)}
                    className="p-2 hover:bg-gray-100 rounded-full ml-2"
                    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quick add buttons */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t bg-gray-50">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 sm:h-10 text-xs sm:text-sm font-medium"
                    disabled={isAdding}
                    onClick={(e) => handleQuickAdd(drink, 1, e)}
                  >
                    {isAdding ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add 1
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3 h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={isAdding}
                    onClick={() => onDrinkSelect(drink)}
                  >
                    More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {drinks.length === 0 && (
        <div className="text-center text-gray-500 py-12 text-sm">
          <p className="mb-1">No drinks found</p>
          {query && <p>Try a different search term</p>}
        </div>
      )}
    </div>
  );
}
