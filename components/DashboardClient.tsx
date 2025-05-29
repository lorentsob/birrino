"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calculateUnits } from "@/lib/calculations";
import { motion } from "framer-motion";
import { DrinkForm } from "@/components/DrinkForm";
import { DrinkPicker } from "@/components/DrinkPicker/DrinkPicker";
import { StatsModal } from "@/components/StatsModal";

interface Drink {
  id: string;
  drink_id: string;
  name: string;
  quantity: number;
  units: number;
  timestamp: string;
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
  useEffect(() => {
    fetchDrinks();
  }, [user]);

  async function fetchDrinks() {
    const { data, error } = await supabase
      .from("consumption")
      .select("*, drinks(name)") // includes drink name via foreign key (if exists)
      .eq("user_name", user)
      .order("timestamp", { ascending: false });

    if (!error && data) {
      setDrinks(
        data.map((d: any) => ({
          ...d,
          name: d.drinks?.name ?? "Unknown",
        }))
      );

      // Calculate time periods
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      console.log("Time periods:", {
        now: now.toISOString(),
        todayStart: todayStart.toISOString(),
        weekStart: weekStart.toISOString(),
        monthStart: monthStart.toISOString(),
        yearStart: yearStart.toISOString()
      });

      console.log("Raw data sample:", data.slice(0, 3));

      // Calculate stats
      const dailyData = data.filter((d: any) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= todayStart;
      });
      const weeklyData = data.filter((d: any) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= weekStart;
      });
      const monthlyData = data.filter((d: any) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= monthStart;
      });
      const yearlyData = data.filter((d: any) => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= yearStart;
      });

      console.log("Filtered data counts:", {
        daily: dailyData.length,
        weekly: weeklyData.length,
        monthly: monthlyData.length,
        yearly: yearlyData.length
      });

      const newStats = {
        dailyUnits: dailyData.reduce((sum: number, d: any) => sum + (d.units || 0), 0),
        weeklyUnits: weeklyData.reduce((sum: number, d: any) => sum + (d.units || 0), 0),
        monthlyUnits: monthlyData.reduce((sum: number, d: any) => sum + (d.units || 0), 0),
        yearlyUnits: yearlyData.reduce((sum: number, d: any) => sum + (d.units || 0), 0),
        dailyDrinks: dailyData.length,
        weeklyDrinks: weeklyData.length,
        monthlyDrinks: monthlyData.length,
        yearlyDrinks: yearlyData.length,
      };

      console.log("Calculated stats:", newStats);

      setStats(newStats);
      setWeekTotal(newStats.weeklyUnits);
    }
  }

  // ----- Derived data -------------------------------------------------------
  const progressPct = Math.min((weekTotal / 14) * 100, 100);

  // ----- UI -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Hello, {user}</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly units card */}
        <Card 
          className="bg-gradient-to-br from-white to-gray-50 border shadow-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowStatsModal(true)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600 mb-2">Weekly Units</p>
            <div className="relative h-20 w-20 mb-2">
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
                  animate={{ strokeDashoffset: 94.2 - (94.2 * progressPct) / 100 }}
                  style={{
                    strokeDasharray: "94.2",
                  }}
                  className={
                    weekTotal >= 14 ? "text-red-500" : "text-blue-500"
                  }
                  transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
                />
              </svg>
              {/* Centre label */}
              <span className="absolute inset-0 flex items-center justify-center font-bold text-lg text-gray-800">
                {weekTotal.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {progressPct.toFixed(0)}% of 14 units
            </p>
          </CardContent>
        </Card>

        {/* Drinks count card */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border shadow-card flex items-center justify-center">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm mb-1 text-gray-600">Total drinks</p>
            <p className="text-4xl font-bold text-gray-800">{drinks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add drink CTA */}
      <Button
        className="w-full py-6 rounded-2xl text-lg shadow-md bg-primary-600 hover:bg-primary-700 text-white"
        onClick={() => setShowDrinkPicker(true)}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add drink
      </Button>

      {/* Recent drinks list */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Recent drinks
        </h2>
        <div className="space-y-3">
          {drinks.map((d) => (
            <Card key={d.id} className="bg-white border shadow-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(d.timestamp).toLocaleString()}
                  </p>
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
        userName={user}
        onDrinkAdded={fetchDrinks}
      />

      {/* Drink Form Modal */}
      <DrinkForm
        open={showDrinkForm}
        onOpenChange={setShowDrinkForm}
        userName={user}
        onDrinkAdded={fetchDrinks}
      />

      {/* Stats Modal */}
      <StatsModal
        open={showStatsModal}
        onOpenChange={setShowStatsModal}
        stats={stats}
        userName={user}
      />
    </div>
  );
}
