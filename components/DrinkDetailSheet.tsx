"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteCount, setDeleteCount] = useState(1);

  // Always call useEffect regardless of conditions
  useEffect(() => {
    if (
      drink &&
      open &&
      drink.count &&
      drink.count > 1 &&
      drink.originalDrinks
    ) {
      setDeleteCount(drink.count);
    }
  }, [open, drink]);

  // Early return after all hooks are called
  if (!drink) return null;

  const isMultipleDrinks =
    drink.count && drink.count > 1 && drink.originalDrinks;
  const multipleDrinks = isMultipleDrinks ? drink.originalDrinks : [];

  const handleDelete = async () => {
    if (isMultipleDrinks && !confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      if (isMultipleDrinks && confirmDelete) {
        // Delete selected number of instances of this drink
        const drinksToDelete = multipleDrinks?.slice(0, deleteCount) || [];
        const drinkIds = drinksToDelete.map((d) => d.id);

        const { error } = await supabase
          .from("consumption")
          .delete()
          .in("id", drinkIds);

        if (error) throw error;
        toast.success(`${drinkIds.length} bevute rimosse con successo`);
      } else {
        // Delete single drink
        const { error } = await supabase
          .from("consumption")
          .delete()
          .eq("id", drink.id);

        if (error) throw error;
        toast.success("Bevuta rimossa con successo");
      }

      onDrinkDeleted();
      onOpenChange(false);
      setConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting drink:", error);
      toast.error("Errore durante la rimozione della bevuta");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(drink.timestamp).toLocaleString("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmDelete(false);
          setDeleteCount(1);
        }
        onOpenChange(open);
      }}
    >
      <SheetContent
        side="bottom"
        className={isMultipleDrinks ? "h-[60vh]" : "h-[40vh]"}
      >
        <SheetHeader className="mb-4">
          <SheetTitle>Dettagli bevuta</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{drink.name}</h3>
              <p className="text-sm text-neutral-500">{formattedDate}</p>
            </div>
            {isMultipleDrinks && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                ×{drink.count}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Quantità</p>
              <p className="text-base font-medium">
                {isMultipleDrinks
                  ? multipleDrinks?.reduce((sum, d) => sum + d.quantity, 0)
                  : drink.quantity}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Unità alcoliche totali</p>
              <p className="text-base font-medium">
                {isMultipleDrinks
                  ? multipleDrinks
                      ?.reduce((sum, d) => sum + d.units, 0)
                      .toFixed(1)
                  : drink.units.toFixed(1)}{" "}
                u
              </p>
            </div>
          </div>

          {isMultipleDrinks && !confirmDelete && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium mb-2">
                Scegli quante bevute rimuovere:
              </p>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteCount(Math.max(1, deleteCount - 1))}
                  disabled={deleteCount <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-medium">
                  {deleteCount} di {drink.count}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeleteCount(Math.min(drink.count || 1, deleteCount + 1))
                  }
                  disabled={deleteCount >= (drink.count || 1)}
                >
                  +
                </Button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(deleteCount / (drink.count || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {isMultipleDrinks && (
            <div className="mt-2 border-t pt-4">
              <p className="text-sm font-medium mb-2">Tutte le bevute:</p>
              <div className="max-h-[120px] overflow-y-auto space-y-2">
                {multipleDrinks?.map((d, index) => (
                  <div
                    key={d.id}
                    className={`text-sm flex justify-between items-center border-b pb-1 ${
                      !confirmDelete && index < deleteCount ? "bg-red-50" : ""
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

          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting
                ? "Rimuovendo..."
                : isMultipleDrinks && confirmDelete
                ? `Conferma rimozione di ${deleteCount} bevute`
                : isMultipleDrinks
                ? `Rimuovi ${deleteCount} bevute`
                : "Rimuovi bevuta"}
            </Button>

            {confirmDelete && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setConfirmDelete(false)}
              >
                Annulla
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
