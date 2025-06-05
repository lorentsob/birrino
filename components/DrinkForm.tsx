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
      toast.success("Drink aggiunto con successo!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a drink</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drink">Select drink</Label>
            <Select value={selectedDrink} onValueChange={setSelectedDrink}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a drink" />
              </SelectTrigger>
              <SelectContent>
                {drinks.map((drink) => (
                  <SelectItem key={drink.id} value={drink.id}>
                    {drink.name} ({drink.volume_ml}ml, {drink.abv}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !userId}>
            {loading ? "Adding..." : "Add drink"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
