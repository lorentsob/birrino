"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { calculateUnits } from "@/lib/calculations";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

interface Drink {
  id: string;
  name: string;
  volume_ml: number;
  abv: number;
}

interface DrinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrinkAdded: () => void;
}

export function DrinkForm({
  open,
  onOpenChange,
  onDrinkAdded,
}: DrinkFormProps) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch available drinks when modal opens
  useEffect(() => {
    if (open) {
      fetchDrinks();
      getCurrentUser();
    }
  }, [open]);

  async function getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUserId(data.session.user.id);
    } else {
      // Se non c'è una sessione, potrebbe essere necessario creare un utente anonimo
      toast.error("Sessione non disponibile. Ricarica la pagina.");
    }
  }

  async function fetchDrinks() {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .order("name");

    if (!error && data) {
      setDrinks(data);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDrink || !userId) {
      if (!userId) toast.error("Sessione utente non disponibile");
      return;
    }

    setLoading(true);
    const drink = drinks.find((d) => d.id === selectedDrink);
    if (!drink) return;

    const units = calculateUnits(drink.volume_ml, drink.abv, quantity);

    const { error } = await supabase.from("consumption").insert({
      drink_id: selectedDrink,
      quantity,
      units,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      console.error("Errore durante l'inserimento:", error);
      toast.error(`Errore: ${error.message}`);
    } else {
      onDrinkAdded();
      onOpenChange(false);
      setSelectedDrink("");
      setQuantity(1);
      toast.success("Bevanda aggiunta con successo!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Aggiungi bevuta
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label
                htmlFor="drink"
                className="text-sm font-medium text-gray-700"
              >
                Seleziona bevanda
              </Label>
              <Select value={selectedDrink} onValueChange={setSelectedDrink}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-150 focus:ring-2 focus:ring-red-400/20 focus:border-red-400">
                  <SelectValue placeholder="Scegli una bevanda" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-lg bg-white">
                  {drinks.map((drink) => (
                    <SelectItem
                      key={drink.id}
                      value={drink.id}
                      className="py-3 px-4 hover:bg-gray-50 focus:bg-gray-50 rounded-lg mx-1 my-0.5"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-gray-900">
                          {drink.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {drink.volume_ml}ml • {drink.abv}%
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                Quantità
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="h-12 border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-150 focus:ring-2 focus:ring-red-400/20 focus:border-red-400 text-base"
                placeholder="1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200"
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-red-400 hover:bg-red-500 text-white font-medium rounded-xl border-0 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !userId || !selectedDrink}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Aggiungendo...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi bevanda
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
