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

  if (!drink) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("consumption")
        .delete()
        .eq("id", drink.id);

      if (error) {
        throw error;
      }

      toast.success("Bevuta rimossa con successo");
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
          <div>
            <h3 className="text-lg font-semibold">{drink.name}</h3>
            <p className="text-sm text-neutral-500">{formattedDate}</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Quantità</p>
              <p className="text-base font-medium">{drink.quantity}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-500">Unità alcoliche</p>
              <p className="text-base font-medium">
                {drink.units.toFixed(1)} u
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Rimuovendo..." : "Rimuovi bevuta"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
