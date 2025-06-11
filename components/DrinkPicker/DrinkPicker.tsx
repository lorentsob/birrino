"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrinkPicker } from "./hooks/useDrinkPicker";
import { DrinkList } from "@/components/DrinkPicker/DrinkList";
import { DrinkQuantitySheet } from "@/components/DrinkPicker/DrinkQuantitySheet";
import { Star, Search, Clock } from "lucide-react";
import { Drink, DrinkCategory } from "@/components/DrinkPicker/types";
import { useFavorites } from "./hooks/useFavorites";
import { useRecents } from "./hooks/useRecents";
import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAnonSession } from "@/hooks/useAnonSession";
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
  useAnonSession();

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
        toast.error("Sessione non trovata");
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
        toast.error(`Errore nell\"aggiungere la bevanda: ${error.message}`);
        console.error("Error adding consumption:", error);
      } else {
        addRecent(drink.id);
        onOpenChange(false); // Close the sheet after adding
      }
    } catch (err) {
      toast.error("Impossibile aggiungere la bevanda");
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
        className="h-[65vh] max-h-[600px] p-0 rounded-t-3xl overflow-hidden bg-white border-0 shadow-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Seleziona una bevanda</SheetTitle>
        </SheetHeader>

        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="sticky top-0 bg-white z-10 pb-2">
          {/* Search Bar */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Cerca bevanda..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 sm:h-14 text-base pl-12 pr-4 bg-gray-50/60 border-gray-200/80 rounded-2xl focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-all duration-200 shadow-sm"
                autoFocus={false}
                onFocus={() => {
                  // Don\"t blur the input when user explicitly taps on it
                  // This allows the keyboard to appear
                }}
              />
            </div>
            <button
              className="hidden" // Invisible button to trigger keyboard on demand
              onClick={handleInputFocus}
            >
              Focus Input
            </button>
          </div>

          {/* Recent & Favourites chips with improved spacing and icons */}
          {query === "" &&
            (favoriteDrinks.length > 0 || recentDrinks.length > 0) && (
              <div className="px-4 sm:px-6 pb-4">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
                  <AnimatePresence>
                    {favoriteDrinks.slice(0, 3).map((drink) => (
                      <motion.div
                        key={`fav-${drink.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200/80 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap rounded-full font-medium transition-all duration-200 hover:bg-yellow-100 active:scale-95 shadow-sm ${
                            addingDrink === drink.id ? "opacity-70" : ""
                          }`}
                          onClick={() =>
                            addingDrink ? null : handleQuickAdd(drink)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            <span className="truncate">
                              {addingDrink === drink.id
                                ? "Aggiungendo..."
                                : drink.name}
                            </span>
                          </div>
                        </Badge>
                      </motion.div>
                    ))}
                    {recentDrinks.slice(0, 2).map((drink) => (
                      <motion.div
                        key={`recent-${drink.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer bg-blue-50 text-blue-700 border-blue-200/80 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap rounded-full font-medium transition-all duration-200 hover:bg-blue-100 active:scale-95 shadow-sm ${
                            addingDrink === drink.id ? "opacity-70" : ""
                          }`}
                          onClick={() =>
                            addingDrink ? null : handleQuickAdd(drink)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">
                              {addingDrink === drink.id
                                ? "Aggiungendo..."
                                : drink.name}
                            </span>
                          </div>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          {/* Category filters */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
              <AnimatePresence>
                {categories.map((cat) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="outline"
                      className={`cursor-pointer h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm whitespace-nowrap rounded-full font-medium transition-all duration-200 active:scale-95 shadow-sm ${
                        category === cat ||
                        (cat === "Tutti" && category === null)
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50 hover:border-gray-300"
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

        {/* Content area with consistent padding */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 sm:px-6 h-full">
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
