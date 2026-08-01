import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return supabaseAdminNotConfigured();

  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  if (!user_id) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from("wishlists")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
