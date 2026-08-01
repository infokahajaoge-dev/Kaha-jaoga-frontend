import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return supabaseAdminNotConfigured();

    const { searchParams } = new URL(req.url);
    const owner_id = searchParams.get("owner_id");

    if (!owner_id) return NextResponse.json([]);

    const { data, error } = await supabaseAdmin
      .from("hotels")
      .select("*")
      .eq("owner_id", owner_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
