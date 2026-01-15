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
import { DRINK_MAX_QUANTITY } from "@/lib/constants";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);
  const { addRecent } = useRecents();

  // Ensure anonymous session
  useAnonSession();

  const handleSave = async () => {
    // Get current user session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      toast.error("Sessione non trovata. Ricarica la pagina.");
      return;
    }

    setIsSaving(true);

    try {
      // Insert consumption record - user_id will be filled automatically by the database trigger
      const { error } = await supabase.from("consumption").insert({
        drink_id: drink.id,
        quantity,
        units: drink.units * quantity,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        toast.error("Errore durante il salvataggio. Riprova.");
        console.error("Error adding consumption:", error);
        return;
      }

      addRecent(drink.id);
      onDrinkAdded();
      onOpenChange(false);
      setQuantity(1); // Reset quantity for next time
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader className="sr-only">
          <SheetTitle>Seleziona quantità per {drink.name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{drink.name}</h3>
            <p className="text-sm text-neutral-500">{drink.category}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantità</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isSaving}
              >
                -
              </Button>
              <span className="text-lg font-medium">{quantity}</span>
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.min(DRINK_MAX_QUANTITY, quantity + 1))}
                disabled={isSaving}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-500">Unità totali</p>
            <p className="text-2xl font-bold">
              {(drink.units * quantity).toFixed(1)} u
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={quantity < 1 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Aggiungi bevuta"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
