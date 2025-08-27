"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  HelpCircle,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAnonSession } from "@/hooks/useAnonSession";
import { motion } from "framer-motion";
import { DrinkForm } from "@/components/DrinkForm";
import { DrinkPicker } from "@/components/DrinkPicker/DrinkPicker";
import { StatsModal } from "@/components/StatsModal";
import { AboutModal } from "@/components/AboutModal";
import toast from "react-hot-toast";
import { DrinkDetailSheet } from "@/components/DrinkDetailSheet";
import DriveTimer from "@/components/DriveTimer";

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
  useAnonSession();

  useEffect(() => {
    fetchDrinks();
  }, []);

  async function fetchDrinks() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error("No active session found");
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

  // Weekly stats state and styling
  const getWeeklyStatsState = () => {
    if (weekTotal >= 14) {
      return {
        type: "danger",
        bgClass: "bg-gradient-to-br from-white to-gray-50",
        iconColor: "text-gray-600",
        textColor: "text-red-500",
        ringColor: "text-red-500",
        icon: AlertCircle,
        status: "Limite superato",
      };
    } else {
      return {
        type: "normal",
        bgClass: "bg-gradient-to-br from-white to-gray-50",
        iconColor: "text-gray-600",
        textColor: "text-gray-800",
        ringColor: "text-primary-600",
        icon: Activity,
        status: "Sotto il limite",
      };
    }
  };

  const weeklyState = getWeeklyStatsState();
  const WeeklyIcon = weeklyState.icon;

  // Drive timer card uses consistent styling
  const driveTimerState = {
    bgClass: "bg-gradient-to-br from-white to-gray-50",
  };

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
          {/* <Button
            variant="ghost"
            size="lg"
            onClick={() => (window.location.href = "/")}
            className="h-12 w-12 sm:h-14 sm:w-14 p-0 rounded-full border border-primary-600 hover:bg-primary-50 flex-shrink-0"
            aria-label="Cambia utente"
          >
            <LogOut className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
          </Button> */}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Weekly units card */}
        <Card
          className="border shadow-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          onClick={() => setShowStatsModal(true)}
        >
          <CardContent
            className={`p-3 sm:p-4 flex flex-col items-center justify-center h-full ${weeklyState.bgClass} border border-gray-200/50 rounded-lg`}
          >
            {/* Main visual indicator */}
            <div className="relative">
              {/* Background circle with state-based gradient */}
              <motion.div
                key={`weekly-bg-${weeklyState.type}`}
                className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-full ${weeklyState.bgClass} border border-gray-200/50 flex items-center justify-center`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              >
                {/* Progress ring - always show */}
                <svg
                  className="absolute inset-1 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-200"
                    fill="none"
                  />
                  <motion.circle
                    key={`weekly-progress-${weekTotal}`}
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ strokeDashoffset: 94.2 }}
                    animate={{
                      strokeDashoffset: weekTotal === 0 ? 94.2 : 94.2 - (94.2 * progressPct) / 100,
                    }}
                    style={{
                      strokeDasharray: "94.2",
                      opacity: weekTotal === 0 ? 0.3 : 1,
                    }}
                    className={weekTotal === 0 ? "text-gray-400" : weeklyState.ringColor}
                    transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
                  />
                </svg>
                {/* Center content - show only percentage */}
                <motion.div
                  className="flex flex-col items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span
                    className={`font-bold text-base sm:text-lg ${weeklyState.textColor}`}
                  >
                    {progressPct.toFixed(0)}%
                  </span>
                </motion.div>
              </motion.div>

              {/* Status indicator badge */}
              <motion.div
                key={`weekly-badge-${weeklyState.type}`}
                className={`absolute -top-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-white flex items-center justify-center ${weeklyState.bgClass}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
              >
                <WeeklyIcon
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${weeklyState.iconColor}`}
                />
              </motion.div>
            </div>

            {/* Text content */}
            <div className="text-center space-y-1">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                {weekTotal === 0
                  ? "Stato della settimana"
                  : "Unità della settimana"}
              </p>

              <motion.p
                key={`weekly-units-${weekTotal}`}
                className={`text-xl sm:text-2xl font-bold ${weeklyState.textColor}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.3 }}
              >
                {weekTotal.toFixed(1)} u
              </motion.p>

              <p
                className={`text-xs sm:text-sm font-medium ${weeklyState.textColor} opacity-80`}
              >
                {weekTotal === 0 ? "Nessun consumo" : weeklyState.status}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {weekTotal > 0 ? 'Totale: 14 unità' : 'Limite: 14 unità'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Drive Timer card */}
        <Card>
          <CardContent
            className={`p-3 sm:p-4 flex flex-col items-center justify-center h-full ${driveTimerState.bgClass} border border-gray-200/50 rounded-lg`}
          >
            <DriveTimer
              consumptions={drinks.map((d) => ({
                units: d.units,
                timestamp: d.timestamp,
              }))}
            />
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
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Le ultime bevute
          </h2>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {collapsedDrinks.map((d, index) => {
            // Determine drink card state based on units
            const getDrinkState = (units: number) => {
              if (units < 1) {
                return {
                  bgClass: "bg-gradient-to-r from-green-50 to-emerald-50",
                  borderColor: "border-emerald-200/60",
                  unitColor: "text-emerald-700",
                };
              } else if (units < 2) {
                return {
                  bgClass: "bg-gradient-to-r from-yellow-50 to-amber-50",
                  borderColor: "border-yellow-200/60",
                  unitColor: "text-yellow-700",
                };
              } else {
                return {
                  bgClass: "bg-gradient-to-r from-red-50 to-rose-50",
                  borderColor: "border-red-200/60",
                  unitColor: "text-red-700",
                };
              }
            };

            const drinkState = getDrinkState(d.units);

            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card
                  className={`${drinkState.bgClass} ${drinkState.borderColor} border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5`}
                  onClick={() => setSelectedDrink(d)}
                >
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Quantity indicator */}
                      {((d.count && d.count > 1) ||
                        (d.totalQuantity && d.totalQuantity > 1)) && (
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-700">
                            {d.totalQuantity || d.count || 1}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 leading-tight">
                          {d.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(d.timestamp).toLocaleString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`px-2 py-1 rounded-full border ${drinkState.borderColor} ${drinkState.bgClass}`}
                      >
                        <p
                          className={`font-bold text-sm ${drinkState.unitColor}`}
                        >
                          {d.units.toFixed(1)} u
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
