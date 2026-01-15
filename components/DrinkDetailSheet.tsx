"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface Drink {
  id: string;
  drink_id: string;
  name: string;
  quantity: number;
  units: number;
  timestamp: string;
  count?: number;
  totalQuantity?: number;
  originalDrinks?: Drink[];
}

interface DrinkDetailSheetProps {
  drink: Drink | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrinkDeleted: () => void;
}

export function DrinkDetailSheet({
  drink,
  open,
  onOpenChange,
  onDrinkDeleted,
}: DrinkDetailSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Early return after all hooks are called
  if (!drink) return null;

  // Get the actual drinks to work with
  const originalDrinks = drink.originalDrinks ?? [drink];
  const hasMultipleRecords = originalDrinks.length > 1;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (hasMultipleRecords) {
        // Multiple separate records collapsed together - delete the first one entirely
        const drinkToDelete = originalDrinks[0];
        const { error } = await supabase
          .from("consumption")
          .delete()
          .eq("id", drinkToDelete.id);

        if (error) throw error;
        toast.success("Bevuta rimossa con successo");
      } else {
        // Single record - check if it has quantity > 1
        const singleDrink = originalDrinks[0];
        const currentQuantity = singleDrink.quantity;

        if (currentQuantity > 1) {
          // Reduce quantity by 1
          const newQuantity = currentQuantity - 1;
          const unitsPerDrink = singleDrink.units / currentQuantity;
          const newUnits = unitsPerDrink * newQuantity;

          const { error } = await supabase
            .from("consumption")
            .update({
              quantity: newQuantity,
              units: newUnits,
            })
            .eq("id", singleDrink.id);

          if (error) throw error;
          toast.success("Una bevuta rimossa con successo");
        } else {
          // Quantity is 1, delete the record entirely
          const { error } = await supabase
            .from("consumption")
            .delete()
            .eq("id", singleDrink.id);

          if (error) throw error;
          toast.success("Bevuta rimossa con successo");
        }
      }

      onDrinkDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting drink:", error);
      toast.error("Errore durante la rimozione della bevuta");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(drink.timestamp).toLocaleString("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader className="mb-4">
          <SheetTitle>Dettagli bevuta</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{drink.name}</h3>
              <p className="text-sm text-neutral-500">{formattedDate}</p>
            </div>
            {/* Show total quantity badge if more than 1 drink total */}
            {(drink.totalQuantity ?? originalDrinks[0].quantity) > 1 && (
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-1 rounded-full">
                ×{drink.totalQuantity ?? originalDrinks[0].quantity}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Quantità</p>
              <p className="text-base font-medium">
                {drink.totalQuantity ??
                  originalDrinks.reduce((sum, d) => sum + d.quantity, 0)}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Unità alcoliche totali</p>
              <p className="text-base font-medium">
                {originalDrinks.reduce((sum, d) => sum + d.units, 0).toFixed(1)}{" "}
                u
              </p>
            </div>
          </div>

          {hasMultipleRecords && (
            <div className="mt-2 border-t pt-4">
              <p className="text-sm font-medium mb-2">Tutte le bevute:</p>
              <div className="max-h-[120px] overflow-y-auto space-y-2">
                {originalDrinks.map((d, index) => (
                  <div
                    key={d.id}
                    className={`text-sm flex justify-between items-center border-b pb-1 ${
                      index === 0 ? "bg-red-50" : ""
                    }`}
                  >
                    <span>
                      {new Date(d.timestamp).toLocaleString("it-IT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span>{d.units.toFixed(1)} u</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed delete button bar at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center py-6 text-base shadow-md"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {isDeleting ? "Rimuovendo..." : "Rimuovi bevuta"}
            </Button>
          </div>

          {/* Add bottom padding to account for fixed button */}
          <div className="pb-20"></div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
