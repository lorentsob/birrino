"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { WEEKLY_UNIT_LIMIT, MONTHLY_UNIT_ESTIMATE } from "@/lib/constants";

interface StatsData {
  dailyUnits: number;
  weeklyUnits: number;
  monthlyUnits: number;
  yearlyUnits: number;
  dailyDrinks: number;
  weeklyDrinks: number;
  monthlyDrinks: number;
  yearlyDrinks: number;
}

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: StatsData;
  userName: string;
}

export function StatsModal({
  open,
  onOpenChange,
  stats,
  userName,
}: StatsModalProps) {
  const progressBarWeekly = Math.min((stats.weeklyUnits / WEEKLY_UNIT_LIMIT) * 100, 100);
  const progressBarMonthly = Math.min((stats.monthlyUnits / MONTHLY_UNIT_ESTIMATE) * 100, 100);

  const statCards = [
    {
      title: "Settimana",
      units: stats.weeklyUnits,
      drinks: stats.weeklyDrinks,
      progress: progressBarWeekly,
      limit: `${WEEKLY_UNIT_LIMIT} unità`,
      color: stats.weeklyUnits > WEEKLY_UNIT_LIMIT ? "text-red-500" : "text-blue-500",
      bgColor: stats.weeklyUnits > WEEKLY_UNIT_LIMIT ? "bg-red-500" : "bg-blue-500",
    },
    {
      title: "Mese",
      units: stats.monthlyUnits,
      drinks: stats.monthlyDrinks,
      progress: progressBarMonthly,
      limit: `~${MONTHLY_UNIT_ESTIMATE} unità`,
      color: stats.monthlyUnits > MONTHLY_UNIT_ESTIMATE ? "text-red-500" : "text-purple-500",
      bgColor: stats.monthlyUnits > MONTHLY_UNIT_ESTIMATE ? "bg-red-500" : "bg-purple-500",
    },
    {
      title: "Anno",
      units: stats.yearlyUnits,
      drinks: stats.yearlyDrinks,
      progress: 0, // No progress bar for yearly
      limit: "",
      color: "text-gray-600",
      bgColor: "bg-gray-500",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">
            Statistiche di {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {stat.title}
                    </h3>
                    <span className="text-sm text-gray-500">{stat.limit}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.units.toFixed(1)} u
                      </p>
                      <p className="text-sm text-gray-500">
                        {stat.drinks} {stat.drinks === 1 ? "bevuta" : "bevute"}
                      </p>
                    </div>

                    {stat.progress > 0 && (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                        <svg
                          className="absolute inset-0 transform -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-gray-200"
                            fill="none"
                          />
                          <motion.circle
                            cx="18"
                            cy="18"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ strokeDashoffset: 88 }}
                            animate={{
                              strokeDashoffset: 88 - (88 * stat.progress) / 100,
                            }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            style={{
                              strokeDasharray: "88",
                            }}
                            className={stat.bgColor}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {Math.round(stat.progress)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {stat.progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${stat.bgColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-balance text-gray-600 text-center">
            Informazioni basate sulle linee guida del Servizio Sanitario
            Nazionale. Non superare le 14 unità a settimana distribuite su
            almeno 3 giorni
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
