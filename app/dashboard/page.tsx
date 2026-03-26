"use client";

import { DashboardClient } from "@/components/DashboardClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentSessionUserId } from "@/lib/session";

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const userId = await getCurrentSessionUserId();

      if (!userId) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();
      if (error || !data) {
        router.push("/");
        return;
      }
      setUserName(data.display_name);
    };

    loadProfile();
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
