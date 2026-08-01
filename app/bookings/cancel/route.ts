import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return supabaseAdminNotConfigured();

  const { id } = await req.json();
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
