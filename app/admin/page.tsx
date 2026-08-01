"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/hooks/useAuth";
import { PasswordInput } from "@/components/PasswordInput";

const ADMIN_PASSWORD = "admin@kaha123";

function AdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "hotels" | "bookings" | "users">("dashboard");
  const [hotelFilter, setHotelFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = async () => {
    const res = await fetch("/api/admin/get-hotels");
    const data = await res.json();
    setHotels(Array.isArray(data) ? data : []);
  };

  const fetchBookings = async () => {
    const res = await fetch("/api/admin/get-bookings");
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/get-users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    async function load() {
      await Promise.all([fetchHotels(), fetchBookings(), fetchUsers()]);
      setLoading(false);
    }
    void load();
    // Mount-only data load for admin dashboard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateHotelStatus = async (id: string, status: string, note?: string) => {
    setActionLoading(id);
    await fetch("/api/admin/update-hotel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, admin_note: note || "" }),
    });
    await fetchHotels();
    setActionLoading(null);
  };

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatCurrency = (n: number) => `₹${(n || 0).toLocaleString()}`;

  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((a, b) => a + (b.total_price || 0), 0);
  const pendingHotels = hotels.filter(h => h.status === "pending");
  const approvedHotels = hotels.filter(h => h.status === "approved");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const filteredHotels = hotels.filter(h => h.status === hotelFilter);

  // ✅ PASSWORD GATE — ALWAYS FIRST
  if (!adminUnlocked) {
    return (
      <div className="min-h-screen bg-[#0f2c4c] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[40px] p-10 text-center max-w-sm w-full shadow-2xl">
          <p className="text-5xl mb-4">👑</p>
          <h2 className="text-2xl font-black italic tracking-tighter text-[#0f2c4c] mb-2">Admin Access</h2>
          <p className="text-slate-400 font-medium text-sm mb-6">Enter admin password to continue</p>
          <PasswordInput
            placeholder="Enter admin password"
            value={adminInput}
            onChange={e => { setAdminInput(e.target.value); setWrongPassword(false); }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (adminInput === ADMIN_PASSWORD) setAdminUnlocked(true);
                else setWrongPassword(true);
              }
            }}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm mb-3"
          />
          {wrongPassword && <p className="text-red-500 font-bold text-sm mb-3">❌ Wrong password! Try again.</p>}
          <button
            onClick={() => {
              if (adminInput === ADMIN_PASSWORD) setAdminUnlocked(true);
              else setWrongPassword(true);
            }}
            className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition mb-3"
          >
            Enter Admin Panel →
          </button>
          <button onClick={() => router.push("/")} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ LOADING — SECOND
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Loading Data...
    </div>
  );

  // ✅ MAIN ADMIN PANEL
  return (
    <main className="min-h-screen bg-slate-50 font-sans">

      {/* ADMIN NAVBAR */}
      <nav className="bg-[#0f2c4c] text-white px-4 md:px-6 py-4 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h2 className="text-base md:text-lg font-black tracking-tighter uppercase italic">Kaha Jaoge Admin</h2>
            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest hidden md:block">Super Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingHotels.length > 0 && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
              {pendingHotels.length} pending
            </div>
          )}
          <span className="text-blue-300 text-sm font-bold hidden md:block">{user?.email}</span>
          <button onClick={() => router.push("/")} className="bg-white/10 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-black hover:bg-white/20 transition">
            View Site →
          </button>
        </div>
      </nav>

      {/* SIDEBAR + CONTENT */}
      <div className="flex">

        {/* SIDEBAR */}
        <div className="w-14 md:w-56 bg-white border-r border-slate-100 min-h-screen shrink-0 sticky top-16 h-[calc(100vh-64px)]">
          <div className="p-2 md:p-4 space-y-2">
            {[
              { key: "dashboard", icon: "📊", label: "Dashboard" },
              { key: "hotels", icon: "🏨", label: "Hotels" },
              { key: "bookings", icon: "📅", label: "Bookings" },
              { key: "users", icon: "👥", label: "Users" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`w-full flex items-center gap-3 px-2 md:px-3 py-3 rounded-2xl font-black text-sm transition ${activeTab === item.key ? "bg-[#0f2c4c] text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className="hidden md:block uppercase tracking-widest text-xs">{item.label}</span>
                {item.key === "hotels" && pendingHotels.length > 0 && (
                  <span className="hidden md:flex ml-auto bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full items-center justify-center">
                    {pendingHotels.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-grow p-4 md:p-10 overflow-auto">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 mb-6 md:mb-8">Dashboard Overview</h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
                {[
                  { icon: "💰", label: "Total Revenue", val: formatCurrency(totalRevenue), bg: "bg-green-50", color: "text-green-700" },
                  { icon: "📅", label: "Total Bookings", val: bookings.length, bg: "bg-blue-50", color: "text-blue-700" },
                  { icon: "🏨", label: "Live Hotels", val: approvedHotels.length, bg: "bg-purple-50", color: "text-purple-700" },
                  { icon: "👥", label: "Total Users", val: users.length, bg: "bg-amber-50", color: "text-amber-700" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-4 md:p-6 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100`}>
                    <p className="text-2xl md:text-3xl mb-2 md:mb-3">{stat.icon}</p>
                    <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
                {[
                  { icon: "⏳", label: "Pending", val: pendingHotels.length, color: "text-amber-600" },
                  { icon: "✅", label: "Confirmed", val: confirmedBookings.length, color: "text-green-600" },
                  { icon: "❌", label: "Cancelled", val: bookings.filter(b => b.status === "cancelled").length, color: "text-red-600" },
                  { icon: "🏗️", label: "Rejected", val: hotels.filter(h => h.status === "rejected").length, color: "text-slate-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100 text-center">
                    <p className="text-xl md:text-2xl mb-1 md:mb-2">{stat.icon}</p>
                    <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {pendingHotels.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[20px] md:rounded-[24px] p-4 md:p-6 mb-6 md:mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <h3 className="font-black text-amber-800 text-base md:text-lg">⚠️ {pendingHotels.length} Hotel{pendingHotels.length > 1 ? "s" : ""} Awaiting Approval</h3>
                      <p className="text-amber-600 font-medium text-sm mt-1">Review and approve or reject hotel submissions.</p>
                    </div>
                    <button onClick={() => { setActiveTab("hotels"); setHotelFilter("pending"); }} className="bg-amber-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-700 transition whitespace-nowrap">
                      Review Now →
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 md:p-6 mb-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="font-black text-base md:text-lg">Recent Bookings</h3>
                  <button onClick={() => setActiveTab("bookings")} className="text-blue-600 font-black text-sm hover:underline">View All →</button>
                </div>
                {bookings.slice(0, 5).length === 0 ? (
                  <p className="text-slate-400 font-bold text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="font-black text-sm text-slate-900">{booking.guest_name}</p>
                          <p className="text-slate-400 text-xs font-bold">{booking.hotel_name} · {booking.booking_ref}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-600 text-sm">{formatCurrency(booking.total_price)}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="font-black text-base md:text-lg">Recent Hotel Submissions</h3>
                  <button onClick={() => setActiveTab("hotels")} className="text-blue-600 font-black text-sm hover:underline">View All →</button>
                </div>
                {hotels.slice(0, 5).length === 0 ? (
                  <p className="text-slate-400 font-bold text-center py-8">No hotel submissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {hotels.slice(0, 5).map(hotel => (
                      <div key={hotel.id} className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img src={hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100"} className="w-10 h-10 object-cover rounded-xl" alt={hotel.name} />
                          <div>
                            <p className="font-black text-sm text-slate-900">{hotel.name}</p>
                            <p className="text-slate-400 text-xs font-bold">📍 {hotel.location}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${hotel.status === "approved" ? "bg-green-100 text-green-700" : hotel.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {hotel.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HOTELS TAB */}
          {activeTab === "hotels" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900">Hotel Management</h1>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "approved", "rejected"] as const).map(filter => (
                    <button key={filter} onClick={() => setHotelFilter(filter)}
                      className={`px-3 md:px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition ${hotelFilter === filter ? "bg-[#0f2c4c] text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"}`}>
                      {filter === "pending" ? "⏳" : filter === "approved" ? "✅" : "❌"} {filter} ({hotels.filter(h => h.status === filter).length})
                    </button>
                  ))}
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
                  <p className="text-5xl mb-4">{hotelFilter === "pending" ? "⏳" : hotelFilter === "approved" ? "✅" : "❌"}</p>
                  <h3 className="text-xl font-black text-slate-400">No {hotelFilter} hotels</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredHotels.map(hotel => (
                    <div key={hotel.id} className="bg-white rounded-[24px] md:rounded-[28px] overflow-hidden shadow-sm border border-slate-100">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-56 h-48 shrink-0">
                          <img src={hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"} className="w-full h-full object-cover" alt={hotel.name} />
                        </div>
                        <div className="flex-grow p-5 md:p-6">
                          <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-black text-slate-900">{hotel.name}</h3>
                              <p className="text-slate-400 font-bold text-sm">📍 {hotel.address_full || `${hotel.location}, India`}</p>
                              <p className="text-slate-400 font-bold text-sm">🏷️ {hotel.category} · {hotel.star_rating}⭐ · {hotel.total_rooms} rooms</p>
                              <p className="text-slate-400 font-bold text-sm">💰 ₹{hotel.price?.toLocaleString()}/night</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${hotel.status === "approved" ? "bg-green-100 text-green-700" : hotel.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                              {hotel.status}
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 md:p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: "Owner", val: hotel.owner_name || "N/A" },
                              { label: "Email", val: hotel.owner_email || "N/A" },
                              { label: "Phone", val: hotel.owner_phone || "N/A" },
                              { label: "GST No.", val: hotel.gst_number || "N/A" },
                            ].map(item => (
                              <div key={item.label}>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="font-black text-sm text-slate-900 truncate">{item.val}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3 mb-4 flex-wrap">
                            {hotel.doc_gst && (
                              <a href={hotel.doc_gst} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-blue-100 transition border border-blue-200">
                                📄 View GST
                              </a>
                            )}
                            {hotel.doc_aadhaar && (
                              <a href={hotel.doc_aadhaar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-purple-100 transition border border-purple-200">
                                🪪 View Aadhaar
                              </a>
                            )}
                          </div>

                          <div className="flex gap-2 mb-4 overflow-x-auto">
                            {[
                              { url: hotel.img, label: "Main" },
                              { url: hotel.photo_room, label: "Room" },
                              { url: hotel.photo_bathroom, label: "Bath" },
                              { url: hotel.photo_pool, label: "Pool" },
                              { url: hotel.photo_reception, label: "Reception" },
                            ].filter(p => p.url).map(photo => (
                              <div key={photo.label} className="shrink-0">
                                <img src={photo.url} className="w-16 h-14 object-cover rounded-xl border-2 border-slate-100" alt={photo.label} />
                                <p className="text-[9px] font-black text-slate-400 text-center mt-1 uppercase">{photo.label}</p>
                              </div>
                            ))}
                          </div>

                          {hotel.amenities?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {hotel.amenities.map((a: string) => (
                                <span key={a} className="text-[9px] bg-slate-100 text-slate-500 font-black px-2 py-1 rounded-md uppercase">{a}</span>
                              ))}
                            </div>
                          )}

                          <p className="text-slate-400 text-xs font-bold mb-4">Submitted: {formatDate(hotel.created_at)}</p>

                          {hotel.status === "pending" && (
                            <div className="flex gap-3 flex-wrap">
                              <button onClick={() => updateHotelStatus(hotel.id, "approved")} disabled={actionLoading === hotel.id} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-60">
                                {actionLoading === hotel.id ? "..." : "✅ Approve & Go Live"}
                              </button>
                              <button onClick={() => {
                                const note = prompt("Reason for rejection:");
                                if (note !== null) updateHotelStatus(hotel.id, "rejected", note || "Does not meet quality standards.");
                              }} disabled={actionLoading === hotel.id} className="bg-red-500 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-60">
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          {hotel.status === "approved" && (
                            <div className="flex gap-3 flex-wrap">
                              <button onClick={() => updateHotelStatus(hotel.id, "rejected", "Removed by admin.")} disabled={actionLoading === hotel.id} className="bg-red-100 text-red-600 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-200 transition">
                                Remove from Site
                              </button>
                              <button onClick={() => router.push(`/hotel/${hotel.id}`)} className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition">
                                View Live →
                              </button>
                            </div>
                          )}
                          {hotel.status === "rejected" && (
                            <div className="flex gap-3 flex-wrap">
                              <button onClick={() => updateHotelStatus(hotel.id, "approved")} disabled={actionLoading === hotel.id} className="bg-green-100 text-green-700 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-200 transition">
                                ✅ Approve Instead
                              </button>
                              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <p className="text-red-600 text-xs font-bold">Reason: {hotel.admin_note || "N/A"}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900">All Bookings</h1>
                <input type="text" placeholder="Search by guest or hotel..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm w-full md:w-64" />
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                  { label: "Total Revenue", val: formatCurrency(totalRevenue), color: "text-green-600" },
                  { label: "Total Bookings", val: bookings.length, color: "text-blue-600" },
                  { label: "Confirmed", val: confirmedBookings.length, color: "text-[#0f2c4c]" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100 text-center">
                    <p className={`text-lg md:text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {bookings.filter(b => !searchQuery || b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
                  <p className="text-5xl mb-4">📅</p>
                  <h3 className="text-xl font-black text-slate-400">No bookings found</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.filter(b => !searchQuery || b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(booking => (
                    <div key={booking.id} className="bg-white p-4 md:p-6 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                        <div>
                          <h3 className="font-black text-base md:text-lg text-slate-900">{booking.guest_name}</h3>
                          <p className="text-slate-400 font-bold text-sm">📧 {booking.guest_email}</p>
                          {booking.guest_phone && <p className="text-slate-400 font-bold text-sm">📞 {booking.guest_phone}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-600 text-lg md:text-xl">{formatCurrency(booking.total_price)}</p>
                          <p className="text-slate-400 text-xs font-bold">{booking.booking_ref}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                        {[
                          { label: "Hotel", val: booking.hotel_name },
                          { label: "Room", val: booking.room_type },
                          { label: "Check-in", val: formatDate(booking.check_in) },
                          { label: "Check-out", val: formatDate(booking.check_out) },
                          { label: "Nights", val: booking.nights },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 px-3 py-2 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="font-black text-slate-900 text-sm truncate">{item.val}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs font-bold mt-3">Booked: {formatDate(booking.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900">All Users</h1>
                <input type="text" placeholder="Search by email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm w-full md:w-64" />
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                  { label: "Total Users", val: users.length, color: "text-[#0f2c4c]" },
                  { label: "Hotel Owners", val: hotels.map(h => h.owner_email).filter((v, i, a) => a.indexOf(v) === i).length, color: "text-purple-600" },
                  { label: "Customers", val: Math.max(0, users.length - hotels.map(h => h.owner_email).filter((v, i, a) => a.indexOf(v) === i).length), color: "text-blue-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100 text-center">
                    <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[24px] md:rounded-[28px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100">
                  <h3 className="font-black text-base md:text-lg">Registered Users</h3>
                </div>
                {users.filter(u => !searchQuery || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="font-black text-slate-400">No users found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {users.filter(u => !searchQuery || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                      const isOwner = hotels.some(h => h.owner_email === u.email);
                      const userBookings = bookings.filter(b => b.guest_email === u.email);
                      return (
                        <div key={u.id} className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition flex-wrap gap-3">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#0f2c4c] rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                              {(u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{u.user_metadata?.full_name || "No name"}</p>
                              <p className="text-slate-400 text-xs font-bold">{u.email}</p>
                              <p className="text-slate-400 text-xs font-bold">Joined: {formatDate(u.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {isOwner && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Hotel Owner</span>}
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{userBookings.length} booking{userBookings.length !== 1 ? "s" : ""}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.email_confirmed_at ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {u.email_confirmed_at ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}