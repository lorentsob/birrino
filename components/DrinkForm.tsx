'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateUnits } from '@/lib/calculations';
import toast from 'react-hot-toast';

type Drink = {
  id: string;
  name: string;
  volume_ml: number;
  abv: number;
  type: string;
};

type DrinkFormProps = {
  userName: string;
  onDrinkAdded: () => void;
};

export default function DrinkForm({ userName, onDrinkAdded }: DrinkFormProps) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [drinkTypes, setDrinkTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [estimatedUnits, setEstimatedUnits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDrinks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('drinks')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setDrinks(data);
          
          // Extract unique drink types
          const types = Array.from(new Set(data.map(drink => drink.type)));
          setDrinkTypes(types);
          
          if (types.length > 0) {
            setSelectedType(types[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching drinks:', error);
        toast.error('Failed to load drinks. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    fetchDrinks();
  }, []);

  // Update selected drink when drink type changes
  useEffect(() => {
    const filteredDrinks = drinks.filter(drink => drink.type === selectedType);
    if (filteredDrinks.length > 0) {
      setSelectedDrink(filteredDrinks[0].id);
    } else {
      setSelectedDrink('');
    }
  }, [selectedType, drinks]);

  // Calculate estimated units when drink or quantity changes
  useEffect(() => {
    if (selectedDrink && quantity > 0) {
      const drink = drinks.find(d => d.id === selectedDrink);
      if (drink) {
        const units = calculateUnits(drink.volume_ml, drink.abv, quantity);
        setEstimatedUnits(parseFloat(units.toFixed(2)));
      }
    } else {
      setEstimatedUnits(0);
    }
  }, [selectedDrink, quantity, drinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDrink || quantity <= 0) {
      toast.error('Please select a drink and quantity');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const drink = drinks.find(d => d.id === selectedDrink);
      if (!drink) {
        throw new Error('Selected drink not found');
      }
      
      const units = calculateUnits(drink.volume_ml, drink.abv, quantity);
      
      const { error } = await supabase
        .from('consumption')
        .insert({
          user_name: userName,
          drink_id: selectedDrink,
          quantity: quantity,
          units: units,
        });
      
      if (error) throw error;
      
      toast.success('Drink added successfully!');
      setQuantity(1);
      onDrinkAdded();
    } catch (error) {
      console.error('Error adding drink:', error);
      toast.error('Failed to add drink. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Drink</h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-gray-500">Loading drinks...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Drink Type</label>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={drinkTypes.length === 0 || submitting}
            >
              {drinkTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Drink</label>
            <select
              className="input"
              value={selectedDrink}
              onChange={(e) => setSelectedDrink(e.target.value)}
              disabled={submitting}
            >
              {drinks
                .filter(drink => drink.type === selectedType)
                .map((drink) => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name} ({drink.volume_ml}ml, {drink.abv}%)
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="label">
              Quantity: {quantity}
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || submitting}
              >
                -
              </button>
              
              <input
                type="range"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={submitting}
              />
              
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800"
                onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                disabled={quantity >= 10 || submitting}
              >
                +
              </button>
            </div>
          </div>
          
          {estimatedUnits > 0 && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-700">
                <span className="font-medium">Estimated Units:</span>{' '}
                <span className="text-primary-700 font-semibold">{estimatedUnits}</span>
              </p>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Drink'}
          </button>
        </form>
      )}
    </div>
  );
}