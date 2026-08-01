"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/hooks/useAuth";

function BookingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    async function load(userId: string) {
      const res = await fetch("/api/bookings/my-bookings?user_id=" + userId);
      const data = await res.json();
      if (cancelled) return;
      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    void load(user.id);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    setCancellingId(null);
  };

  const handleDownload = (booking: any) => {
    const content = `
========================================
        KAHA JAOGE — BOOKING TICKET
========================================
Booking Ref   : ${booking.booking_ref}
Status        : ${booking.status?.toUpperCase()}
Guest Name    : ${booking.guest_name}
Hotel         : ${booking.hotel_name}
Room Type     : ${booking.room_type}
Check-in      : ${formatDate(booking.check_in)}
Check-out     : ${formatDate(booking.check_out)}
Duration      : ${booking.nights} Night(s)
Amount Paid   : ₹${booking.total_price?.toLocaleString()}
========================================
Thank you for booking with Kaha Jaoge!
support: hello@kahajaoge.com
========================================`.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `KahaJaoge_${booking.booking_ref}.txt`;
    a.click();
  };

  const formatDate = (d: string) => {
    if (!d) return "Not specified";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const filtered = bookings.filter(b => {
    if (activeTab === "upcoming") return b.status === "confirmed";
    if (activeTab === "completed") return b.status === "completed";
    return b.status === "cancelled";
  });

  const totalSpent = bookings.filter(b => b.status !== "cancelled").reduce((a, b) => a + (b.total_price || 0), 0);
  const displayName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Loading your trips...
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-1">My Travel Dashboard</p>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 capitalize">
              {displayName}&apos;s Trips ✈️
            </h1>
            <p className="text-slate-400 font-medium mt-1">{user?.email}</p>
          </div>
          <button onClick={() => router.push("/")} className="bg-[#0f2c4c] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition">
            + Book New Stay
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: "🗓️", label: "Total Bookings", val: bookings.length },
            { icon: "✅", label: "Upcoming Stays", val: bookings.filter(b => b.status === "confirmed").length },
            { icon: "🏁", label: "Completed", val: bookings.filter(b => b.status === "completed").length },
            { icon: "💰", label: "Total Spent", val: `₹${totalSpent.toLocaleString()}` },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-xl font-black text-[#0f2c4c]">{stat.val}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-200 mb-8">
          {[
            { key: "upcoming", label: `✅ Upcoming (${bookings.filter(b => b.status === "confirmed").length})` },
            { key: "completed", label: `🏁 Completed (${bookings.filter(b => b.status === "completed").length})` },
            { key: "cancelled", label: `❌ Cancelled (${bookings.filter(b => b.status === "cancelled").length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 font-black text-xs uppercase tracking-widest transition border-b-2 -mb-[2px] whitespace-nowrap ${activeTab === tab.key ? "border-[#0f2c4c] text-[#0f2c4c]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* BOOKINGS */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
            <p className="text-6xl mb-4">🧳</p>
            <h3 className="text-2xl font-black text-slate-400">No {activeTab} bookings</h3>
            <p className="text-slate-400 mt-2 mb-6">Start exploring and book your first stay!</p>
            <button onClick={() => router.push("/")} className="bg-[#0f2c4c] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition">
              Explore Hotels
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map(booking => (
              <div key={booking.id} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition group">
                <div className="flex flex-col md:flex-row">

                  {/* IMAGE */}
                  <div className="relative w-full md:w-56 h-48 shrink-0 overflow-hidden">
                    <img src={"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"} alt={booking.hotel_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${booking.status === "confirmed" ? "bg-green-500 text-white" : booking.status === "cancelled" ? "bg-red-500 text-white" : "bg-slate-600 text-white"}`}>
                      {booking.status === "confirmed" ? "✓ Confirmed" : booking.status === "cancelled" ? "✕ Cancelled" : "✓ Completed"}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="flex-grow p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-900">{booking.hotel_name}</h3>
                          <p className="text-slate-400 font-bold text-sm">🛏️ {booking.room_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Booking Ref</p>
                          <p className="font-black text-[#0f2c4c] tracking-widest text-sm">{booking.booking_ref}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap mb-4">
                        <div className="bg-slate-50 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-in</p>
                          <p className="font-black text-slate-900 text-sm">{formatDate(booking.check_in)}</p>
                        </div>
                        <div className="flex items-center text-slate-300 font-black">→</div>
                        <div className="bg-slate-50 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-out</p>
                          <p className="font-black text-slate-900 text-sm">{formatDate(booking.check_out)}</p>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Duration</p>
                          <p className="font-black text-blue-700 text-sm">{booking.nights} Night{booking.nights > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 flex-wrap gap-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                        <p className="text-2xl font-black text-green-600">₹{booking.total_price?.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <button onClick={() => handleDownload(booking)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">
                          📥 Ticket
                        </button>
                        {booking.status === "confirmed" && (
                          <button onClick={() => handleCancel(booking.id)} disabled={cancellingId === booking.id} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition disabled:opacity-60">
                            {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                        <button onClick={() => router.push(`/hotel/${booking.hotel_id}`)} className="bg-[#0f2c4c] text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition">
                          View Hotel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsContent />
    </ProtectedRoute>
  );
}