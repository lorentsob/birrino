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
import { Star } from "lucide-react";
import { Drink } from "@/components/DrinkPicker/types";
import { useFavorites } from "./hooks/useFavorites";
import { useRecents } from "./hooks/useRecents";

interface DrinkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrinkAdded: () => void;
  userName: string;
}

export function DrinkPicker({
  open,
  onOpenChange,
  onDrinkAdded,
  userName,
}: DrinkPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const { drinks, category, setCategory, filtered } = useDrinkPicker();
  const { favorites } = useFavorites();
  const { recents } = useRecents();

  const categories = ["All", "Wine", "Beer", "Cocktail", "Spirits"] as const;

  // Get favorite and recent drinks
  const favoriteDrinks = drinks.filter((drink) => favorites.includes(drink.id));
  const recentDrinks = drinks.filter((drink) => recents.includes(drink.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Select a drink</SheetTitle>
        </SheetHeader>
        <div className="sticky top-0 bg-background border-b">
          {/* Search Bar */}
          <div className="p-4 pb-2">
            <Input
              placeholder="Search drinks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 text-base px-4"
              autoFocus
            />
          </div>

          {/* Recent & Favourites chips (auto-collapse when empty) */}
          {query === "" &&
            (favoriteDrinks.length > 0 || recentDrinks.length > 0) && (
              <div className="px-4 pb-2">
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
                          className="cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200 h-8 px-3 text-sm whitespace-nowrap"
                          onClick={() => setSelectedDrink(drink)}
                        >
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {drink.name}
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
                          className="cursor-pointer h-8 px-3 text-sm whitespace-nowrap"
                          onClick={() => setSelectedDrink(drink)}
                        >
                          {drink.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          {/* Category filters */}
          <div className="px-4 pb-4">
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
                        category === cat ? "bg-neutral-800 text-white" : ""
                      }`}
                      onClick={() => setCategory(cat === "All" ? null : cat)}
                    >
                      {cat}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-4">
          <DrinkList
            drinks={filtered}
            onDrinkSelect={setSelectedDrink}
            onDrinkAdded={() => {
              onDrinkAdded();
              onOpenChange(false); // Auto-close after quick add
            }}
            userName={userName}
            query={query}
          />
        </div>

        {selectedDrink && (
          <DrinkQuantitySheet
            drink={selectedDrink}
            open={!!selectedDrink}
            onOpenChange={(open: boolean) => !open && setSelectedDrink(null)}
            userName={userName}
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
