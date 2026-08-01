"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function PartnerDashboard() {
  const router = useRouter();
  const [hotels, setHotels] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hotels" | "bookings" | "stats">("hotels");
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/partner"); return; }
      setUser(session.user);
      const res = await fetch("/api/partner/my-hotels?owner_id=" + session.user.id);
      const data = await res.json();
      setHotels(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const approvedHotels = hotels.filter(h => h.status === "approved");
  const pendingHotels = hotels.filter(h => h.status === "pending");
  const rejectedHotels = hotels.filter(h => h.status === "rejected");
  const totalRevenue = hotelBookings.filter(b => b.status !== "cancelled").reduce((a, b) => a + (b.total_price || 0), 0);

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return "✅";
    if (status === "rejected") return "❌";
    return "⏳";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Loading...
    </div>
  );

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-10 flex-wrap gap-4">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-1">Hotel Owner Portal</p>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 capitalize">
              Welcome, {displayName}! 🏨
            </h1>
            <p className="text-slate-400 font-medium mt-1">{user?.email}</p>
          </div>
          <button onClick={() => router.push("/partner")} className="bg-[#0f2c4c] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition">
            + List New Hotel
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: "🏨", label: "Total Hotels", val: hotels.length, color: "text-[#0f2c4c]" },
            { icon: "✅", label: "Live Hotels", val: approvedHotels.length, color: "text-green-600" },
            { icon: "⏳", label: "Under Review", val: pendingHotels.length, color: "text-amber-600" },
            { icon: "💰", label: "Total Earnings", val: `₹${totalRevenue.toLocaleString()}`, color: "text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-200 mb-8">
          {[
            { key: "hotels", label: `🏨 My Hotels (${hotels.length})` },
            { key: "bookings", label: `📅 Bookings (${hotelBookings.length})` },
            { key: "stats", label: "📊 Analytics" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 font-black text-xs uppercase tracking-widest transition border-b-2 -mb-[2px] whitespace-nowrap ${activeTab === tab.key ? "border-[#0f2c4c] text-[#0f2c4c]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* HOTELS TAB */}
        {activeTab === "hotels" && (
          <div className="flex flex-col gap-6">
            {hotels.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
                <p className="text-6xl mb-4">🏨</p>
                <h3 className="text-2xl font-black text-slate-400">No hotels submitted yet</h3>
                <p className="text-slate-400 mt-2 mb-6">Submit your first hotel to get started!</p>
                <button onClick={() => router.push("/partner")} className="bg-[#0f2c4c] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition">
                  List Your Hotel
                </button>
              </div>
            ) : (
              hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-56 h-48 shrink-0">
                      <img src={hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"} className="w-full h-full object-cover" alt={hotel.name} />
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{hotel.name}</h3>
                          <p className="text-slate-400 font-bold text-sm">📍 {hotel.address_full || `${hotel.location}, India`}</p>
                          <p className="text-slate-400 font-bold text-sm">🏷️ {hotel.category} · {hotel.star_rating}⭐ · {hotel.total_rooms} Rooms</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${statusColor(hotel.status)}`}>
                          {statusIcon(hotel.status)} {hotel.status}
                        </span>
                      </div>

                      {/* HOTEL DETAILS */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: "Price/Night", val: `₹${hotel.price?.toLocaleString()}` },
                          { label: "Check-in", val: hotel.check_in_time || "12:00" },
                          { label: "Check-out", val: hotel.check_out_time || "11:00" },
                          { label: "GST No.", val: hotel.gst_number || "N/A" },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 px-3 py-2 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="font-black text-slate-900 text-sm">{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* PHOTO THUMBNAILS */}
                      <div className="flex gap-2 mb-4 overflow-x-auto">
                        {[
                          { url: hotel.img, label: "Main" },
                          { url: hotel.photo_room, label: "Room" },
                          { url: hotel.photo_bathroom, label: "Bath" },
                          { url: hotel.photo_pool, label: "Pool" },
                          { url: hotel.photo_reception, label: "Reception" },
                        ].filter(p => p.url).map(photo => (
                          <div key={photo.label} className="shrink-0">
                            <img src={photo.url} className="w-16 h-12 object-cover rounded-lg" alt={photo.label} />
                            <p className="text-[8px] font-black text-slate-400 text-center uppercase mt-0.5">{photo.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* DOCUMENTS */}
                      <div className="flex gap-3 mb-4 flex-wrap">
                        {hotel.doc_gst && (
                          <a href={hotel.doc_gst} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-blue-100 transition">
                            📄 GST Certificate
                          </a>
                        )}
                        {hotel.doc_aadhaar && (
                          <a href={hotel.doc_aadhaar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-purple-100 transition">
                            🪪 Aadhaar Card
                          </a>
                        )}
                      </div>

                      {/* STATUS MESSAGES */}
                      {hotel.status === "pending" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-amber-700 text-xs font-bold">⏳ Your hotel is under review. Our team will verify your documents within 24-48 hours!</p>
                        </div>
                      )}
                      {hotel.status === "approved" && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                          <p className="text-green-700 text-xs font-bold">✅ Your hotel is LIVE on Kaha Jaoge and visible to thousands of travellers!</p>
                          <button onClick={() => router.push(`/hotel/${hotel.id}`)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-green-700 transition ml-3 shrink-0">
                            View Live →
                          </button>
                        </div>
                      )}
                      {hotel.status === "rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-red-700 text-xs font-bold">❌ {hotel.admin_note || "Application rejected. Please contact support at hello@kahajaoge.com"}</p>
                        </div>
                      )}

                      <p className="text-slate-400 text-xs font-bold mt-3">Submitted: {formatDate(hotel.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div>
            {hotelBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
                <p className="text-6xl mb-4">📅</p>
                <h3 className="text-2xl font-black text-slate-400">No bookings yet</h3>
                <p className="text-slate-400 mt-2">Bookings will appear here once your hotel goes live and customers start booking!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {hotelBookings.map(booking => (
                  <div key={booking.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h3 className="font-black text-slate-900">{booking.guest_name}</h3>
                        <p className="text-slate-400 font-bold text-sm">{booking.guest_email} · {booking.guest_phone}</p>
                        <p className="text-slate-400 font-bold text-sm">🛏️ {booking.room_type} · {booking.nights} nights</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-600 text-xl">₹{booking.total_price?.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs font-bold">{booking.booking_ref}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4 flex-wrap">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Check-in</p>
                        <p className="font-black text-sm">{formatDate(booking.check_in)}</p>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Check-out</p>
                        <p className="font-black text-sm">{formatDate(booking.check_out)}</p>
                      </div>
                      <div className={`px-3 py-2 rounded-xl ${booking.status === "confirmed" ? "bg-green-50" : "bg-red-50"}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                        <p className={`font-black text-sm ${booking.status === "confirmed" ? "text-green-700" : "text-red-700"}`}>{booking.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "stats" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[28px] shadow-sm border border-slate-100">
              <h3 className="font-black text-lg mb-6">Hotel Performance</h3>
              <div className="space-y-4">
                {[
                  { label: "Total Hotels Listed", val: hotels.length, max: 10 },
                  { label: "Hotels Live", val: approvedHotels.length, max: hotels.length || 1 },
                  { label: "Pending Approval", val: pendingHotels.length, max: hotels.length || 1 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                      <span>{item.label}</span><span>{item.val}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0f2c4c] rounded-full transition-all" style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[28px] shadow-sm border border-slate-100">
              <h3 className="font-black text-lg mb-6">Quick Info</h3>
              <div className="space-y-3">
                {[
                  { icon: "📧", label: "Support Email", val: "hello@kahajaoge.com" },
                  { icon: "⏱️", label: "Review Time", val: "24-48 hours" },
                  { icon: "💳", label: "Commission", val: "Zero — Keep 100%" },
                  { icon: "📱", label: "Support Phone", val: "+91 98765 43210" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-400 font-bold text-sm">{item.icon} {item.label}</span>
                    <span className="font-black text-slate-900 text-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-[#0f2c4c] to-blue-600 p-8 rounded-[28px] text-white">
              <h3 className="font-black text-xl mb-2">Need Help?</h3>
              <p className="text-blue-200 font-medium mb-4">Our partner support team is available 24/7 to help you get the most out of Kaha Jaoge.</p>
              <div className="flex gap-3 flex-wrap">
                <a href="mailto:hello@kahajaoge.com" className="bg-white text-[#0f2c4c] px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition">
                  📧 Email Support
                </a>
                <a href="tel:+919876543210" className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-white/20 transition border border-white/20">
                  📞 Call Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}