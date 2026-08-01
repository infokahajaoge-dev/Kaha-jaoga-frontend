import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { code, booking_amount } = await req.json();
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) return NextResponse.json({ valid: false, message: "Invalid coupon code!" });
    if (coupon.used_count >= coupon.max_uses) return NextResponse.json({ valid: false, message: "Coupon has expired!" });
    if (new Date(coupon.valid_until) < new Date()) return NextResponse.json({ valid: false, message: "Coupon has expired!" });
    if (booking_amount < coupon.min_booking_amount) return NextResponse.json({ valid: false, message: `Minimum booking amount is ₹${coupon.min_booking_amount}!` });

    const discount_amount = Math.round((booking_amount * coupon.discount_percent) / 100);
    const final_amount = booking_amount - discount_amount;

    return NextResponse.json({
      valid: true,
      discount_percent: coupon.discount_percent,
      discount_amount,
      final_amount,
      message: `🎉 ${coupon.discount_percent}% discount applied!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}