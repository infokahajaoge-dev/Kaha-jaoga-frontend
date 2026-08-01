"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/hooks/useAuth";

function WishlistContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const res = await fetch("/api/wishlist/get?user_id=" + user!.id);
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    void load();
  }, [user?.id]);

  const handleRemove = async (hotel_id: string) => {
    if (!user) return;
    setRemoving(hotel_id);
    await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, hotel_id }),
    });
    setWishlist(prev => prev.filter(w => w.hotel_id !== hotel_id));
    setRemoving(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Loading Wishlist...
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div>
            <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-1">❤️ My Wishlist</p>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Saved Hotels</h1>
            <p className="text-slate-400 font-medium mt-1">{wishlist.length} hotel{wishlist.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={() => router.push("/")} className="bg-[#0f2c4c] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition">
            + Explore More
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
            <p className="text-6xl mb-4">❤️</p>
            <h3 className="text-2xl font-black text-slate-400">No saved hotels yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Click the heart on any hotel to save it here!</p>
            <button onClick={() => router.push("/")} className="bg-[#0f2c4c] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition">
              Explore Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.hotel_img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    alt={item.hotel_name}
                  />
                  <button
                    onClick={() => handleRemove(item.hotel_id)}
                    disabled={removing === item.hotel_id}
                    className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg text-sm"
                  >
                    {removing === item.hotel_id ? "..." : "❤️"}
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-slate-900 mb-1">{item.hotel_name}</h3>
                  <p className="text-slate-400 text-sm font-bold mb-3">📍 {item.hotel_location}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div>
                      <span className="text-xl font-black text-[#0f2c4c]">₹{item.hotel_price?.toLocaleString()}</span>
                      <span className="text-slate-400 text-xs font-bold">/night</span>
                    </div>
                    <button
                      onClick={() => router.push(`/hotel/${item.hotel_id}`)}
                      className="bg-[#0f2c4c] text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition"
                    >
                      Book Now
                    </button>
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

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}
