"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hotel = searchParams.get("hotel") || "Your Hotel";
  const price = searchParams.get("price") || "0";
  const name = searchParams.get("name") || "Guest";
  const nights = searchParams.get("nights") || "1";
  const room = searchParams.get("room") || "Deluxe Room";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const bookingRef = searchParams.get("ref") || "KJ00000000";

  const formatDate = (d: string) => {
    if (!d) return "Not specified";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const handleDownload = () => {
    const content = `
========================================
        KAHA JAOGE — BOOKING TICKET
========================================
Booking Ref   : ${bookingRef}
Status        : CONFIRMED
Guest Name    : ${name}
Hotel         : ${hotel}
Room Type     : ${room}
Check-in      : ${formatDate(checkin)}
Check-out     : ${formatDate(checkout)}
Duration      : ${nights} Night(s)
Amount Paid   : Rs.${parseInt(price).toLocaleString()}
========================================
Thank you for booking with Kaha Jaoge!
Support: hello@kahajaoge.com
========================================`.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `KahaJaoge_${bookingRef}.txt`;
    a.click();
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0f2c4c] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">

        {/* SUCCESS HEADER */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-400/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">Booking Confirmed!</h1>
          <p className="text-blue-300 font-medium">Your stay has been successfully reserved</p>
        </div>

        {/* TICKET CARD */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl">

          {/* TICKET TOP */}
          <div className="bg-[#0f2c4c] p-6 flex justify-between items-start">
            <div>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">Booking Reference</p>
              <p className="text-white text-2xl font-black tracking-widest">{bookingRef}</p>
            </div>
            <div className="bg-green-400 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              ✓ Confirmed
            </div>
          </div>

          {/* DOTTED DIVIDER */}
          <div className="relative h-6 bg-white">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-[#0f2c4c] rounded-full"></div>
            <div className="absolute -right-3 top-0 w-6 h-6 bg-[#0f2c4c] rounded-full"></div>
            <div className="border-t-2 border-dashed border-slate-200 absolute top-3 left-3 right-3"></div>
          </div>

          {/* HOTEL INFO */}
          <div className="px-6 py-5 border-b border-dashed border-slate-200">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Hotel</p>
            <p className="text-2xl font-black text-[#0f2c4c]">{hotel}</p>
            <p className="text-slate-500 font-bold text-sm mt-1">🛏️ {room}</p>
          </div>

          {/* DATES */}
          <div className="px-6 py-5 border-b border-dashed border-slate-200">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Check-in</p>
                <p className="font-black text-slate-900 text-sm">{formatDate(checkin)}</p>
                <p className="text-slate-400 text-xs font-bold mt-0.5">From 12:00 PM</p>
              </div>
              <div className="text-center">
                <div className="bg-slate-100 rounded-full px-3 py-1.5 text-xs font-black text-slate-500">
                  {nights} Night{Number(nights) > 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Check-out</p>
                <p className="font-black text-slate-900 text-sm">{formatDate(checkout)}</p>
                <p className="text-slate-400 text-xs font-bold mt-0.5">By 11:00 AM</p>
              </div>
            </div>
          </div>

          {/* GUEST + AMOUNT */}
          <div className="px-6 py-5 border-b border-dashed border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Guest</p>
                <p className="font-black text-slate-900 capitalize">{name}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-3xl font-black text-green-600">₹{parseInt(price).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* DOTTED DIVIDER BOTTOM */}
          <div className="relative h-6 bg-white">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-[#0f2c4c] rounded-full"></div>
            <div className="absolute -right-3 top-0 w-6 h-6 bg-[#0f2c4c] rounded-full"></div>
            <div className="border-t-2 border-dashed border-slate-200 absolute top-3 left-3 right-3"></div>
          </div>

          {/* INFO */}
          <div className="px-6 py-5 bg-amber-50">
            <p className="text-amber-700 text-xs font-bold">⚠️ Please carry a valid government ID at check-in. A confirmation email has been sent to your email address.</p>
          </div>

          {/* ACTIONS */}
          <div className="p-6 flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition"
            >
              📥 Download
            </button>
            <button
              onClick={() => router.push("/bookings")}
              className="flex-1 bg-[#0f2c4c] text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition"
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* BACK HOME */}
        <div className="text-center mt-6">
          <button onClick={() => router.push("/")} className="text-blue-300 font-black text-sm hover:text-white transition uppercase tracking-widest">
            ← Back to Home
          </button>
        </div>

        {/* CONTACT */}
        <div className="text-center mt-4">
          <p className="text-blue-400 text-xs font-bold">Need help? 📧 hello@kahajaoge.com · 📞 +91 98765 43210</p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}