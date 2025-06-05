"use client";

import { DashboardClient } from "@/components/DashboardClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the user name from localStorage
    const storedUserName = localStorage.getItem("currentUserName");

    if (!storedUserName) {
      // Redirect to home if no user is selected
      router.push("/");
      return;
    }

    setUserName(storedUserName);
  }, [router]);

  if (!userName) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return <DashboardClient user={userName} />;
}
