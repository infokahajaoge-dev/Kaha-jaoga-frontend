import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return supabaseAdminNotConfigured();

    const { user_id, hotel_id, hotel_name, hotel_img, hotel_location, hotel_price, hotel_rating } = await req.json();
    const { data: existing } = await supabaseAdmin
      .from("wishlists")
      .select("id")
      .eq("user_id", user_id)
      .eq("hotel_id", hotel_id)
      .single();

    if (existing) {
      await supabaseAdmin.from("wishlists").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed" });
    } else {
      await supabaseAdmin.from("wishlists").insert({ user_id, hotel_id, hotel_name, hotel_img, hotel_location, hotel_price, hotel_rating });
      return NextResponse.json({ action: "added" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
