import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return supabaseAdminNotConfigured();

  const { searchParams } = new URL(req.url);
  const hotel_id = searchParams.get("hotel_id");
  if (!hotel_id) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("hotel_id", hotel_id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
