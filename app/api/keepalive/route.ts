// app/api/keepalive/route.ts
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Vercel Cron sends the secret as a Bearer token in the Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.KEEPALIVE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch a real drink ID to use in the test entry
    const { data: drinks, error: fetchError } = await supabaseAdmin
      .from("drinks")
      .select("id, volume_ml, abv")
      .limit(1)
      .single();

    if (fetchError || !drinks) {
      return NextResponse.json(
        { ok: false, error: "Could not fetch a drink: " + fetchError?.message },
        { status: 500 }
      );
    }

    // 2. Insert a test consumption row (null user_id = no real user)
    const units = (drinks.volume_ml * drinks.abv * 1) / 1000;
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("consumption")
      .insert({
        drink_id: drinks.id,
        quantity: 1,
        units,
        user_id: null,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { ok: false, error: "Insert failed: " + insertError?.message },
        { status: 500 }
      );
    }

    // 3. Delete it immediately — no junk data left behind
    const { error: deleteError } = await supabaseAdmin
      .from("consumption")
      .delete()
      .eq("id", inserted.id);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: "Cleanup delete failed: " + deleteError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "DB keepalive: insert + delete cycle completed successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
