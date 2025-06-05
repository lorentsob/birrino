"use client";

import { DashboardClient } from "@/components/DashboardClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (!userId) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (!profile) {
        router.push("/");
        return;
      }

      setUserName(profile.display_name);
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
