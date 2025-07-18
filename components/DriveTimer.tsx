"use client";

import { useEffect, useState } from "react";
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

  // Color coding based on time remaining
  const textColorClass =
    mins === 0
      ? "text-emerald-600"
      : mins <= 30
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center">
        Potrai guidare tra
      </p>
      <p
        className={`text-2xl sm:text-3xl font-bold ${textColorClass} text-center`}
        aria-live="polite"
      >
        {mins === 0 ? (
          <span className="text-emerald-600">✅ Ora puoi guidare</span>
        ) : (
          <>
            {hours > 0 && `${hours}h `}
            {minutes}m
          </>
        )}
      </p>
      {mins > 0 && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Stima basata su 1 unità/ora
        </p>
      )}
    </div>
  );
}
