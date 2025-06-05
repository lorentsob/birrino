"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrinkPicker } from "./hooks/useDrinkPicker";
import { DrinkList } from "@/components/DrinkPicker/DrinkList";
import { DrinkQuantitySheet } from "@/components/DrinkPicker/DrinkQuantitySheet";
import { Star } from "lucide-react";
import { Drink, DrinkCategory } from "@/components/DrinkPicker/types";
import { useFavorites } from "./hooks/useFavorites";
import { useRecents } from "./hooks/useRecents";
import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

interface DrinkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrinkAdded: () => void;
}

export function DrinkPicker({
  open,
  onOpenChange,
  onDrinkAdded,
}: DrinkPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [addingDrink, setAddingDrink] = useState<string | null>(null);
  const { drinks, category, setCategory, filtered } = useDrinkPicker();
  const { favorites } = useFavorites();
  const { recents, addRecent } = useRecents();

  // Ensure anonymous session
  useEffect(() => {
    async function ensureAnonymousSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          return;
        }

        if (!data.session) {
          const { error: signInError } =
            await supabase.auth.signInAnonymously();
          if (signInError) {
            console.error("Error signing in anonymously:", signInError);
          }
        }
      } catch (err) {
        console.error("Session initialization error:", err);
      }
    }

    ensureAnonymousSession();
  }, []);

  // Focus handling
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleInputFocus = () => {
    // Small delay to avoid keyboard popping up during animation
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  };

  const categories = [
    "Tutti",
    "Vino",
    "Birra",
    "Cocktail",
    "Superalcolici",
  ] as const;

  // Quick add function for recent and favorite drinks
  const handleQuickAdd = async (drink: Drink) => {
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

      const { error } = await supabase.from("consumption").insert({
        drink_id: drink.id,
        quantity: 1,
        units: drink.units * 1,
        timestamp: new Date().toISOString(),
        user_id: userId,
      });

      if (error) {
        toast.error(`Error adding drink: ${error.message}`);
        console.error("Error adding consumption:", error);
      } else {
        addRecent(drink.id);
        onDrinkAdded();
        onOpenChange(false); // Close the sheet after adding
      }
    } catch (err) {
      toast.error("Failed to add drink");
      console.error("Error adding drink:", err);
    } finally {
      setAddingDrink(null);
    }
  };

  // Get favorite and recent drinks
  const favoriteDrinks = drinks.filter((drink) => favorites.includes(drink.id));
  const recentDrinks = drinks.filter((drink) => recents.includes(drink.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[65vh] max-h-[600px] p-0 rounded-t-xl overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Seleziona una bevuta</SheetTitle>
        </SheetHeader>
        <div className="sticky top-0 bg-background border-b z-10">
          {/* Search Bar */}
          <div className="p-3 sm:p-4 pb-2">
            <Input
              ref={inputRef}
              placeholder="Cerca la bevuta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 text-base px-4"
              autoFocus={false}
              onFocus={() => {
                // Don't blur the input when user explicitly taps on it
                // This allows the keyboard to appear
              }}
            />
            <button
              className="hidden" // Invisible button to trigger keyboard on demand
              onClick={handleInputFocus}
            >
              Focus Input
            </button>
          </div>

          {/* Recent & Favourites chips (auto-collapse when empty) */}
          {query === "" &&
            (favoriteDrinks.length > 0 || recentDrinks.length > 0) && (
              <div className="px-3 sm:px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  <AnimatePresence>
                    {favoriteDrinks.slice(0, 3).map((drink) => (
                      <motion.div
                        key={`fav-${drink.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200 h-8 px-3 text-sm whitespace-nowrap ${
                            addingDrink === drink.id ? "opacity-70" : ""
                          }`}
                          onClick={() =>
                            addingDrink ? null : handleQuickAdd(drink)
                          }
                        >
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {addingDrink === drink.id ? "Adding..." : drink.name}
                        </Badge>
                      </motion.div>
                    ))}
                    {recentDrinks.slice(0, 2).map((drink) => (
                      <motion.div
                        key={`recent-${drink.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer bg-blue-50 text-blue-700 border-blue-200 h-8 px-3 text-sm whitespace-nowrap ${
                            addingDrink === drink.id ? "opacity-70" : ""
                          }`}
                          onClick={() =>
                            addingDrink ? null : handleQuickAdd(drink)
                          }
                        >
                          <span className="text-blue-500 mr-1 text-xs">↻</span>
                          {addingDrink === drink.id ? "Adding..." : drink.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          {/* Category filters */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <AnimatePresence>
                {categories.map((cat) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Badge
                      variant="outline"
                      className={`cursor-pointer h-9 px-4 text-sm whitespace-nowrap ${
                        category === cat ||
                        (cat === "Tutti" && category === null)
                          ? "bg-neutral-800 text-white"
                          : ""
                      }`}
                      onClick={() =>
                        setCategory(
                          cat === "Tutti" ? null : (cat as DrinkCategory)
                        )
                      }
                    >
                      {cat}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-4">
          <DrinkList
            drinks={filtered}
            onDrinkSelect={setSelectedDrink}
            onDrinkAdded={() => {
              onDrinkAdded();
              onOpenChange(false); // Auto-close after quick add
            }}
            query={query}
          />
        </div>

        {selectedDrink && (
          <DrinkQuantitySheet
            drink={selectedDrink}
            open={!!selectedDrink}
            onOpenChange={(open: boolean) => !open && setSelectedDrink(null)}
            onDrinkAdded={() => {
              onDrinkAdded();
              setSelectedDrink(null);
              onOpenChange(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
