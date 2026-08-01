import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      guest_name,
      guest_email,
      hotel_name,
      room_type,
      check_in,
      check_out,
      nights,
      total_price,
      booking_ref,
    } = await req.json();

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: guest_email,
      subject: `✅ Booking Confirmed — ${booking_ref} | Kaha Jaoge`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">

          <!-- HEADER -->
          <div style="background:#0f2c4c;padding:40px 20px;text-align:center;">
            <h1 style="color:white;font-size:32px;font-weight:900;font-style:italic;margin:0;letter-spacing:-1px;">Kaha Jaoge?</h1>
            <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;font-weight:600;">Luxury stays across India</p>
          </div>

          <!-- SUCCESS BANNER -->
          <div style="background:#22c55e;padding:20px;text-align:center;">
            <h2 style="color:white;margin:0;font-size:20px;font-weight:900;">✅ Booking Confirmed!</h2>
            <p style="color:#dcfce7;margin:4px 0 0;font-size:14px;">Your stay has been successfully booked</p>
          </div>

          <!-- MAIN CONTENT -->
          <div style="max-width:600px;margin:30px auto;padding:0 20px;">

            <!-- GREETING -->
            <div style="background:white;border-radius:20px;padding:30px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
              <p style="font-size:18px;font-weight:900;color:#0f2c4c;margin:0 0 8px;">Namaste, ${guest_name}! 🙏</p>
              <p style="color:#64748b;font-size:14px;margin:0;line-height:1.6;">Thank you for choosing Kaha Jaoge. Your booking is confirmed and we are excited to host you. Here are your booking details:</p>
            </div>

            <!-- BOOKING TICKET -->
            <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);margin-bottom:20px;">

              <!-- TICKET HEADER -->
              <div style="background:#0f2c4c;padding:20px 30px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <p style="color:#93c5fd;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Booking Reference</p>
                  <p style="color:white;font-size:22px;font-weight:900;letter-spacing:2px;margin:0;">${booking_ref}</p>
                </div>
                <div style="background:#22c55e;color:white;padding:8px 16px;border-radius:50px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">Confirmed</div>
              </div>

              <!-- HOTEL INFO -->
              <div style="padding:25px 30px;border-bottom:2px dashed #f1f5f9;">
                <p style="color:#94a3b8;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Hotel</p>
                <p style="color:#0f2c4c;font-size:22px;font-weight:900;margin:0 0 4px;">${hotel_name}</p>
                <p style="color:#64748b;font-size:14px;margin:0;font-weight:600;">🛏️ ${room_type}</p>
              </div>

              <!-- DATES -->
              <div style="padding:25px 30px;display:grid;grid-template-columns:1fr auto 1fr;gap:20px;border-bottom:2px dashed #f1f5f9;">
                <div>
                  <p style="color:#94a3b8;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Check-in</p>
                  <p style="color:#0f2c4c;font-size:18px;font-weight:900;margin:0;">${new Date(check_in).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <p style="color:#64748b;font-size:12px;font-weight:600;margin:4px 0 0;">From 12:00 PM</p>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;">
                  <div style="background:#f1f5f9;border-radius:50px;padding:8px 16px;font-size:12px;font-weight:900;color:#64748b;">${nights} Night${Number(nights) > 1 ? "s" : ""}</div>
                </div>
                <div style="text-align:right;">
                  <p style="color:#94a3b8;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Check-out</p>
                  <p style="color:#0f2c4c;font-size:18px;font-weight:900;margin:0;">${new Date(check_out).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <p style="color:#64748b;font-size:12px;font-weight:600;margin:4px 0 0;">By 11:00 AM</p>
                </div>
              </div>

              <!-- AMOUNT -->
              <div style="padding:25px 30px;background:#f8fafc;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <p style="color:#94a3b8;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Total Amount Paid</p>
                    <p style="color:#22c55e;font-size:32px;font-weight:900;margin:0;">₹${Number(total_price).toLocaleString()}</p>
                  </div>
                  <div style="text-align:right;">
                    <p style="color:#94a3b8;font-size:11px;font-weight:600;margin:0;">Includes all taxes</p>
                    <p style="color:#94a3b8;font-size:11px;font-weight:600;margin:4px 0 0;">& service charges</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- IMPORTANT INFO -->
            <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:20px;padding:25px;margin-bottom:20px;">
              <h3 style="color:#c2410c;font-size:14px;font-weight:900;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">⚠️ Important Information</h3>
              <ul style="color:#9a3412;font-size:13px;margin:0;padding-left:20px;line-height:2;">
                <li>Please carry a valid government ID at check-in</li>
                <li>Free cancellation available 24 hours before check-in</li>
                <li>Contact the hotel directly for special requests</li>
                <li>Show this email or your booking reference at check-in</li>
              </ul>
            </div>

            <!-- CONTACT -->
            <div style="background:#0f2c4c;border-radius:20px;padding:25px;text-align:center;margin-bottom:20px;">
              <p style="color:#93c5fd;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Need Help?</p>
              <p style="color:white;font-size:14px;font-weight:600;margin:0 0 4px;">📧 hello@kahajaoge.com</p>
              <p style="color:white;font-size:14px;font-weight:600;margin:0;">📞 +91 98765 43210</p>
            </div>

            <!-- FOOTER -->
            <div style="text-align:center;padding:20px 0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© 2024 Kaha Jaoge. All rights reserved.</p>
              <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Luxury stays across India, at your fingertips.</p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}