import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Lazy Supabase service-role client.
 * Returns null when env is missing so Next.js build does not crash
 * during "Collecting page data" without SUPABASE_SERVICE_ROLE_KEY.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function supabaseAdminNotConfigured() {
  return NextResponse.json(
    { error: "Supabase admin not configured" },
    { status: 503 }
  );
}
