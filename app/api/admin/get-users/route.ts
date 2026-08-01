import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseAdminNotConfigured } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return supabaseAdminNotConfigured();

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data.users || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
