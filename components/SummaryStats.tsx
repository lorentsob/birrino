"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDateRange } from "@/lib/calculations";
import toast from "react-hot-toast";

type SummaryStatsProps = {
  userId: string;
  refreshTrigger: number;
};

type PeriodData = {
  evening: number;
  week: number;
  month: number;
  year: number;
};

export default function SummaryStats({
  userId,
  refreshTrigger,
}: SummaryStatsProps) {
  const [stats, setStats] = useState<PeriodData>({
    evening: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const [loading, setLoading] = useState(true);
  const [previousWeekTotal, setPreviousWeekTotal] = useState(0);

  // Force show toast whenever component mounts if weekly limit exceeded
  useEffect(() => {
    // Using a slight delay to ensure it's visible after component mount
    const timer = setTimeout(() => {
      if (stats.week > 14) {
        toast(
          (t) => (
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">👀</span>
              <span>Sei già al 5° Birrino: occhio</span>
            </div>
          ),
          { duration: 3000 }
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [stats.week]);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("consumption")
          .select("units, timestamp")
          .eq("user_id", userId);

        if (error) throw error;

        if (data) {
          // Calculate stats for each period
          const eveningRange = getDateRange("evening");
          const weekRange = getDateRange("week");
          const monthRange = getDateRange("month");
          const yearRange = getDateRange("year");

          // Calculate previous week's total
          const currentWeekStart = new Date(weekRange.start);
          const previousWeekStart = new Date(currentWeekStart);
          previousWeekStart.setDate(previousWeekStart.getDate() - 7);
          const previousWeekEnd = new Date(currentWeekStart);
          previousWeekEnd.setDate(previousWeekEnd.getDate() - 0.001); // Just before current week starts

          const prevWeekSum = data.reduce((sum, record) => {
            const timestamp = new Date(record.timestamp);
            if (
              timestamp >= previousWeekStart &&
              timestamp <= previousWeekEnd
            ) {
              return sum + (record.units || 0);
            }
            return sum;
          }, 0);

          setPreviousWeekTotal(parseFloat(prevWeekSum.toFixed(1)));

          // Calculate current totals
          const periods: PeriodData = {
            evening: 0,
            week: 0,
            month: 0,
            year: 0,
          };

          data.forEach((record) => {
            const timestamp = new Date(record.timestamp);
            const units = record.units || 0;

            if (
              timestamp >= eveningRange.start &&
              timestamp <= eveningRange.end
            ) {
              periods.evening += units;
            }

            if (timestamp >= weekRange.start && timestamp <= weekRange.end) {
              periods.week += units;
            }

            if (timestamp >= monthRange.start && timestamp <= monthRange.end) {
              periods.month += units;
            }

            if (timestamp >= yearRange.start && timestamp <= yearRange.end) {
              periods.year += units;
            }
          });

          // Format to 1 decimal place
          setStats({
            evening: parseFloat(periods.evening.toFixed(1)),
            week: parseFloat(periods.week.toFixed(1)),
            month: parseFloat(periods.month.toFixed(1)),
            year: parseFloat(periods.year.toFixed(1)),
          });

          // Check if weekly total exceeds 14 units
          const newWeekTotal = periods.week;
          const lastWeekTotal = stats.week;

          if (newWeekTotal > 14) {
            // Show toast whenever weekly total exceeds 14 units
            toast(
              (t) => (
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">👀</span>
                  <span>Sei già al 5° Birrino, occhio!</span>
                </div>
              ),
              { duration: 3000 }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId, refreshTrigger]);

  // Calculate weekly progress as percentage
  const weeklyProgress = Math.min((stats.week / 14) * 100, 100);
  const progressColor = stats.week > 14 ? "bg-red-500" : "bg-primary-500";

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Consumption Summary
      </h2>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-gray-500">Loading stats...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Weekly Consumption
              </span>
              <span
                className={`text-sm font-medium ${
                  stats.week > 14 ? "text-red-600" : "text-gray-700"
                }`}
              >
                {stats.week} / 14 units
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${progressColor}`}
                style={{ width: `${weeklyProgress}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Previous week: {previousWeekTotal} units
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Stasera</p>
              <p className="text-2xl font-semibold text-primary-700">
                {stats.evening}
              </p>
              <p className="text-xs text-gray-500">unità</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Mese</p>
              <p className="text-2xl font-semibold text-primary-700">
                {stats.month}
              </p>
              <p className="text-xs text-gray-500">unità</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Anno</p>
              <p className="text-2xl font-semibold text-primary-700">
                {stats.year}
              </p>
              <p className="text-xs text-gray-500">unità</p>
            </div>
          </div>

          <div className="pt-2 text-center text-sm text-gray-500">
            <p>Limite consigliato: 14 unità a settimana</p>
          </div>
        </div>
      )}
    </div>
  );
}
