"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { minsUntilSober } from "@/lib/calculations";

interface DriveTimerProps {
  consumptions: { units: number; timestamp: string }[];
}

export default function DriveTimer({ consumptions }: DriveTimerProps) {
  const [mins, setMins] = useState(() => minsUntilSober(consumptions));

  // Recalculate actual remaining time every minute based on current time
  useEffect(() => {
    const updateTimer = () => {
      setMins(minsUntilSober(consumptions));
    };

    // Update immediately
    updateTimer();

    // Update every minute with actual recalculation
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [consumptions]); // Re-run when consumptions change

  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  // Determine state and styling
  const getTimerState = () => {
    if (mins === 0) {
      return {
        type: 'safe',
        bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-700',
        ringColor: 'text-emerald-500',
        icon: CheckCircle2,
        message: 'Ora puoi guidare',
        subtitle: 'Sei sobrio'
      };
    } else if (mins <= 30) {
      return {
        type: 'warning',
        bgClass: 'bg-gradient-to-br from-yellow-50 to-amber-100',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-700',
        ringColor: 'text-yellow-500',
        icon: AlertTriangle,
        message: `${hours > 0 ? `${hours}h ` : ''}${minutes}m`,
        subtitle: 'Quasi pronto'
      };
    } else {
      return {
        type: 'danger',
        bgClass: 'bg-gradient-to-br from-red-50 to-rose-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-700',
        ringColor: 'text-red-500',
        icon: AlertCircle,
        message: `${hours > 0 ? `${hours}h ` : ''}${minutes}m`,
        subtitle: 'Non guidare'
      };
    }
  };

  const state = getTimerState();
  const IconComponent = state.icon;

  // Calculate progress for circular indicator (max 4 hours = 240 minutes)
  const maxDisplayMins = 240;
  const progressPct = mins === 0 ? 100 : Math.max(0, ((maxDisplayMins - Math.min(mins, maxDisplayMins)) / maxDisplayMins) * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Main visual indicator */}
      <div className="relative">
        {/* Background circle with state-based gradient */}
        <motion.div
          key={`bg-${state.type}`}
          className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-full ${state.bgClass} flex items-center justify-center`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        >
          {/* Always show progress ring for consistency */}
          <>
            {/* Progress ring */}
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
                key={`progress-${mins}`}
                cx="18"
                cy="18"
                r="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: 94.2 }}
                animate={{
                  strokeDashoffset: mins === 0 ? 0 : 94.2 - (94.2 * progressPct) / 100,
                }}
                style={{
                  strokeDasharray: "94.2",
                }}
                className={state.ringColor}
                transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
              />
            </svg>
            {/* Center icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {mins === 0 ? (
                <Car className={`h-8 w-8 sm:h-10 sm:w-10 ${state.iconColor}`} />
              ) : (
                <Clock className={`h-6 w-6 sm:h-7 sm:w-7 ${state.iconColor}`} />
              )}
            </motion.div>
          </>
        </motion.div>

        {/* Status indicator badge */}
        <motion.div
          key={`badge-${state.type}`}
          className={`absolute -top-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-white flex items-center justify-center ${state.bgClass}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
        >
          <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${state.iconColor}`} />
        </motion.div>
      </div>

      {/* Text content */}
      <div className="text-center space-y-1">
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          {mins === 0 ? 'Stato di guida' : 'Potrai guidare tra'}
        </p>

        <motion.p
          key={`time-${mins}`}
          className={`text-xl sm:text-2xl font-bold ${state.textColor}`}
          aria-live="polite"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {state.message}
        </motion.p>

        <p className={`text-xs sm:text-sm font-medium ${state.textColor} opacity-80`}>
          {state.subtitle}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          {mins > 0 ? 'Stima basata su 1 unità/ora' : 'Guida sicura'}
        </p>
      </div>
    </div>
  );
}
