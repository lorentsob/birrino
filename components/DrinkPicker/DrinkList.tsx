"use client";

import { Drink } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";
import { useFavorites } from "./hooks/useFavorites";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRecents } from "./hooks/useRecents";

interface DrinkListProps {
  drinks: Drink[];
  onDrinkSelect: (drink: Drink) => void;
  onDrinkAdded: () => void;
  userName: string;
  query: string;
}

export function DrinkList({
  drinks,
  onDrinkSelect,
  onDrinkAdded,
  userName,
  query,
}: DrinkListProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { addRecent } = useRecents();
  const [addingDrink, setAddingDrink] = useState<string | null>(null);

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

    const { error } = await supabase.from("consumption").insert({
      user_name: userName,
      drink_id: drink.id,
      quantity,
      units: drink.units * quantity,
      timestamp: new Date().toISOString(),
    });

    if (!error) {
      addRecent(drink.id);
      onDrinkAdded();
    }

    setAddingDrink(null);
  };

  return (
    <div className="h-[calc(60vh-150px)] max-h-[450px] overflow-auto pb-4 overscroll-contain">
      {drinks.map((drink) => {
        const isFavorite = favorites.includes(drink.id);
        const isAdding = addingDrink === drink.id;

        return (
          <Card
            key={drink.id}
            className="mx-1 sm:mx-2 my-1 sm:my-2 border shadow-sm"
          >
            <CardContent className="p-0">
              {/* Main drink info - clickable for custom quantity */}
              <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
                onClick={() => onDrinkSelect(drink)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base mb-1 truncate">
                      {drink.name}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-500">
                      <span>{drink.category}</span>
                      <span>•</span>
                      <span>{drink.units.toFixed(1)} units</span>
                    </div>
                  </div>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleFavorite(drink.id);
                    }}
                    className="p-2 hover:bg-neutral-100 rounded-full ml-2"
                    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-neutral-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quick add buttons */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t bg-neutral-50/50">
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
        <div className="text-center text-neutral-500 py-12">
          <p>No drinks found</p>
          {query && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      )}
    </div>
  );
}
