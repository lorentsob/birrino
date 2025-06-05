"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle, LogOut } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { DrinkForm } from "@/components/DrinkForm";
import { DrinkPicker } from "@/components/DrinkPicker/DrinkPicker";
import { StatsModal } from "@/components/StatsModal";
import { AboutModal } from "@/components/AboutModal";
import toast from "react-hot-toast";
import { DrinkDetailSheet } from "@/components/DrinkDetailSheet";

interface Drink {
  id: string;
  drink_id: string;
  name: string;
  quantity: number;
  units: number;
  timestamp: string;
  user_id: string;
}

interface DrinkWithDetails extends Drink {
  drinks?: {
    name: string;
  };
}

interface DashboardClientProps {
  user: string;
}

export function DashboardClient({ user }: DashboardClientProps) {
  // ----- State --------------------------------------------------------------
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [weekTotal, setWeekTotal] = useState<number>(0);
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [stats, setStats] = useState({
    dailyUnits: 0,
    weeklyUnits: 0,
    monthlyUnits: 0,
    yearlyUnits: 0,
    dailyDrinks: 0,
    weeklyDrinks: 0,
    monthlyDrinks: 0,
    yearlyDrinks: 0,
  });

  // ----- Effects ------------------------------------------------------------
  // Ensure anonymous session
  useEffect(() => {
    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          await supabase.auth.signInAnonymously();
        }
      } catch (error) {
        console.error("Error initializing anonymous session:", error);
      }
    }

    initSession();
  }, []);

  useEffect(() => {
    fetchDrinks();
  }, []);

  async function fetchDrinks() {
    // Get user ID from localStorage
    const userId = localStorage.getItem("currentUserId");

    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }

    const { data, error } = await supabase
      .from("consumption")
      .select("*, drinks(name)")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (!error && data) {
      setDrinks(
        data.map((d: DrinkWithDetails) => ({
          ...d,
          name: d.drinks?.name ?? "Unknown",
          user_id: userId,
        }))
      );

      // Calculate time periods
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      // Calculate stats
      const dailyData = data.filter((d: DrinkWithDetails) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= todayStart;
      });
      const weeklyData = data.filter((d: DrinkWithDetails) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= weekStart;
      });
      const monthlyData = data.filter((d: DrinkWithDetails) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= monthStart;
      });
      const yearlyData = data.filter((d: DrinkWithDetails) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= yearStart;
      });

      const newStats = {
        dailyUnits: dailyData.reduce(
          (sum: number, d: DrinkWithDetails) => sum + (d.units || 0),
          0
        ),
        weeklyUnits: weeklyData.reduce(
          (sum: number, d: DrinkWithDetails) => sum + (d.units || 0),
          0
        ),
        monthlyUnits: monthlyData.reduce(
          (sum: number, d: DrinkWithDetails) => sum + (d.units || 0),
          0
        ),
        yearlyUnits: yearlyData.reduce(
          (sum: number, d: DrinkWithDetails) => sum + (d.units || 0),
          0
        ),
        dailyDrinks: dailyData.length,
        weeklyDrinks: weeklyData.length,
        monthlyDrinks: monthlyData.length,
        yearlyDrinks: yearlyData.length,
      };

      setStats(newStats);
      setWeekTotal(newStats.weeklyUnits);
    }
  }

  // ----- Derived data -------------------------------------------------------
  const progressPct = Math.min((weekTotal / 14) * 100, 100);

  // Collapse identical drinks in the recent list
  const collapsedDrinks = useMemo(() => {
    const drinkMap = new Map();

    drinks.forEach((drink) => {
      const key = drink.drink_id;
      if (!drinkMap.has(key)) {
        drinkMap.set(key, {
          ...drink,
          count: 1,
          totalQuantity: drink.quantity,
          originalDrinks: [drink],
        });
      } else {
        const existingDrink = drinkMap.get(key);
        existingDrink.count += 1;
        existingDrink.totalQuantity =
          (existingDrink.totalQuantity || 0) + drink.quantity;
        existingDrink.originalDrinks.push(drink);
      }
    });

    return Array.from(drinkMap.values());
  }, [drinks]);

  // Show toast when weekly limit is exceeded
  useEffect(() => {
    // Using a slight delay to ensure it's visible after component mount
    const timer = setTimeout(() => {
      if (weekTotal > 14) {
        toast(
          () => (
            <div className="flex items-center bg-gradient-to-r from-red-100 to-red-200 p-2 rounded-md border border-red-300">
              <span className="text-black-800 font-medium">
                Sei già al 5° Birrino:{" "}
                <span className="font-bold text-black-900">Occhio!</span>{" "}
                <span className="text-red-900">👀</span>
              </span>
            </div>
          ),
          {
            duration: 3000,
            style: {
              padding: "0",
            },
          }
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [weekTotal]);

  // ----- UI -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Website Title */}
      <h1 className="text-5xl font-bold text-center text-primary-600">
        5° Birrino
      </h1>
      <div className="flex justify-center items-center">
        <p className="text-lg mx-3 font-medium text-center text-primary-500  tracking-wide">
          Quanti. Non come o perchè.
        </p>
      </div>
      {/* Header with user info and action buttons */}
      <header className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 truncate pr-2">
          Ciao, {user}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowAboutModal(true)}
            className="h-12 w-12 sm:h-14 sm:w-14 p-0 rounded-full border border-primary-600 hover:bg-primary-50 flex-shrink-0"
            aria-label="14 unità alcoliche per fare cosa?"
          >
            <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => (window.location.href = "/")}
            className="h-12 w-12 sm:h-14 sm:w-14 p-0 rounded-full border border-primary-600 hover:bg-primary-50 flex-shrink-0"
            aria-label="Cambia utente"
          >
            <LogOut className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Weekly units card */}
        <Card
          className="bg-gradient-to-br from-white to-gray-50 border shadow-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowStatsModal(true)}
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 text-center">
              Unità della settimana
            </p>
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 mb-1 sm:mb-2">
              {/* Background ring */}
              <svg
                className="absolute inset-0 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200"
                  fill="none"
                />
                {/* Animated progress ring */}
                <motion.circle
                  key={`progress-${weekTotal}`}
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: 94.2 }}
                  animate={{
                    strokeDashoffset: 94.2 - (94.2 * progressPct) / 100,
                  }}
                  style={{
                    strokeDasharray: "94.2",
                  }}
                  className={
                    weekTotal >= 14 ? "text-red-500" : "text-primary-600"
                  }
                  transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
                />
              </svg>
              {/* Centre label */}
              <span className="absolute inset-0 flex items-center justify-center font-bold text-base sm:text-lg text-gray-800">
                {weekTotal.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {progressPct.toFixed(0)}% delle 14 unità
            </p>
          </CardContent>
        </Card>

        {/* Drinks count card */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border shadow-card flex items-center justify-center">
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <p className="text-xs sm:text-sm mb-1 text-gray-600 text-center">
              Tutte le bevute
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800">
              {drinks.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add drink CTA */}
      <Button
        className="w-full py-6 sm:py-8 h-16 sm:h-20 rounded-2xl text-base sm:text-lg shadow-md bg-primary-600 hover:bg-primary-700 text-white"
        onClick={() => setShowDrinkPicker(true)}
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
        Aggiungi bevuta
      </Button>

      {/* Recent drinks list */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
          Le ultime bevute
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {collapsedDrinks.map((d) => (
            <Card
              key={d.id}
              className="bg-white border shadow-card cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedDrink(d)}
            >
              <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {d.name}
                      {((d.count && d.count > 1) ||
                        (d.totalQuantity && d.totalQuantity > 1)) && (
                        <span className="ml-1 text-primary-600 font-semibold">
                          ×{d.totalQuantity || d.count || 1}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(d.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-700">
                  {d.units.toFixed(1)} u
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Drink Picker Modal */}
      <DrinkPicker
        open={showDrinkPicker}
        onOpenChange={setShowDrinkPicker}
        onDrinkAdded={fetchDrinks}
      />

      {/* Drink Form Modal */}
      <DrinkForm
        open={showDrinkForm}
        onOpenChange={setShowDrinkForm}
        onDrinkAdded={fetchDrinks}
      />

      {/* Stats Modal */}
      <StatsModal
        open={showStatsModal}
        onOpenChange={setShowStatsModal}
        stats={stats}
        userName={user}
      />

      {/* About Modal */}
      <AboutModal open={showAboutModal} onOpenChange={setShowAboutModal} />

      {/* Drink Detail Sheet */}
      <DrinkDetailSheet
        drink={selectedDrink}
        open={!!selectedDrink}
        onOpenChange={(open) => !open && setSelectedDrink(null)}
        onDrinkDeleted={fetchDrinks}
      />
    </div>
  );
}
