"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Drink } from "./types";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAnonSession } from "@/hooks/useAnonSession";
import { useRecents } from "@/components/DrinkPicker/hooks/useRecents";

interface DrinkQuantitySheetProps {
  drink: Drink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrinkAdded: () => void;
}

export function DrinkQuantitySheet({
  drink,
  open,
  onOpenChange,
  onDrinkAdded,
}: DrinkQuantitySheetProps) {
  const [quantity, setQuantity] = useState(1);
  const { addRecent } = useRecents();

  // Ensure anonymous session
  useAnonSession();

  const handleSave = async () => {
    // Get current user session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      console.error("No active session found");
      return;
    }

    // Insert consumption record - user_id will be filled automatically by the database trigger
    const { error } = await supabase.from("consumption").insert({
      drink_id: drink.id,
      quantity,
      units: drink.units * quantity,
      timestamp: new Date().toISOString(),
    });

    if (!error) {
      addRecent(drink.id);
      onDrinkAdded();
    } else {
      console.error("Error adding consumption:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader className="sr-only">
          <SheetTitle>Select quantity for {drink.name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{drink.name}</h3>
            <p className="text-sm text-neutral-500">{drink.category}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-lg font-medium">{quantity}</span>
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-500">Total units</p>
            <p className="text-2xl font-bold">
              {(drink.units * quantity).toFixed(1)} u
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={quantity < 1}
          >
            Aggiungi bevuta
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
