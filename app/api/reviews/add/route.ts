import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return supabaseAdminNotConfigured();

    const { hotel_id, hotel_name, user_id, user_name, rating, comment } = await req.json();
    const { error } = await supabaseAdmin.from("reviews").insert({
      hotel_id, hotel_name, user_id, user_name, rating, comment, status: "published"
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
