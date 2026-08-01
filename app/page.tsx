"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/src/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botInput, setBotInput] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: "welcome", role: "bot", text: "Namaste! 🙏 I'm Kaha, your AI travel assistant. Ask me anything about hotels, destinations or travel tips across India!" }
  ]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch("/api/hotels");
        const localData = await res.json();
        const { data: supabaseData } = await supabase
          .from("hotels")
          .select("*")
          .eq("status", "approved");
        const local = Array.isArray(localData) ? localData : [];
        const remote = (Array.isArray(supabaseData) ? supabaseData : []).map((h: any) => ({
          ...h,
          id: `remote-${h.id}`,
        }));
        setHotels([...local, ...remote]);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setWishlist([]);
      return;
    }
    let cancelled = false;
    async function loadWishlist() {
      const res = await fetch("/api/wishlist/get?user_id=" + user!.id);
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setWishlist(data.map((w: any) => w.hotel_id));
      }
    }
    void loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  const handleWishlist = async (e: React.MouseEvent, hotel: any) => {
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    setWishlistLoading(hotel.id);
    await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        hotel_img: hotel.img,
        hotel_location: hotel.location,
        hotel_price: hotel.price,
        hotel_rating: hotel.rating,
      }),
    });
    setWishlist(prev =>
      prev.includes(hotel.id) ? prev.filter(id => id !== hotel.id) : [...prev, hotel.id]
    );
    setWishlistLoading(null);
  };

  const handleSendMessage = async () => {
    if (!botInput.trim() || botLoading) return;
    const userMsg = botInput;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: "user", text: userMsg }]);
    setBotInput("");
    setBotLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "bot", text: "Oops! Something went wrong. Please try again! 🙏" }]);
    } finally {
      setBotLoading(false);
    }
  };

  const sendQuickMessage = async (q: string) => {
    setMessages(prev => [...prev, { id: `quick-${Date.now()}`, role: "user", text: q }]);
    setBotLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "bot", text: "Oops! Try again 🙏" }]);
    } finally {
      setBotLoading(false);
    }
  };

  const categories = [
    { name: "All", icon: "🌎" },
    { name: "Beach", icon: "🏖️" },
    { name: "Mountain", icon: "🏔️" },
    { name: "Heritage", icon: "🕌" },
    { name: "Luxury", icon: "💎" },
  ];

  const processedHotels = hotels
    .filter((hotel) => {
      const name = hotel.name?.toLowerCase() || "";
      const location = hotel.location?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || location.includes(query) || name.includes(query);
      const matchesCategory = activeCategory === "All" || hotel.category === activeCategory;
      const matchesPrice = hotel.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "low-to-high") return a.price - b.price;
      if (sortBy === "high-to-low") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const handleSearch = () => {
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  const packages = [
    { title: "Royal Rajasthan", desc: "5 Nights + Private Tour of Palaces.", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600", price: "₹45,000", tag: "Most Popular" },
    { title: "Tropical Goa", desc: "Beach parties and serene sunset cruises.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600", price: "₹28,000", tag: "Best Value" },
  ];

  const contactItems = [
    { icon: "📞", title: "Call Us", val: "+91 98765 43210" },
    { icon: "✉️", title: "Email Us", val: "hello@kahajaoge.com" },
    { icon: "📍", title: "Visit Us", val: "123 Travel Lane, Mumbai, MH" },
  ];

  const stats = [
    { num: "500+", label: "Hotels" },
    { num: "50K+", label: "Guests" },
    { num: "4.8★", label: "Rating" },
  ];

  const quickQuestions = [
    "Best hotel in Goa? 🏖️",
    "Budget under ₹8000",
    "Heritage stays 🏰",
    "Mountain getaway 🏔️",
  ];

  return (
    <main className="min-h-screen relative font-sans text-slate-900 scroll-smooth">

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-black/30"></div>
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=90&w=2000&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <Navbar />

      {/* HERO */}
      <div className="relative min-h-[600px] md:h-[680px] flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-white text-5xl md:text-8xl font-black italic tracking-tighter animate-float drop-shadow-2xl">
            Kaha Jaoge?
          </h1>
          <p className="text-blue-50 text-base md:text-xl mt-3 md:mt-4 font-medium drop-shadow-md px-4">
            Luxury stays across India, at your fingertips.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="w-full max-w-5xl">
          <div className="bg-white/95 backdrop-blur-md p-4 md:p-8 rounded-[24px] md:rounded-[40px] shadow-2xl border border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where are you going?"
                  className="p-3 bg-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-400 transition outline-none font-bold text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                  Budget <span className="text-[#0f2c4c]">₹{maxPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range" min="1000" max="25000" step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-8 cursor-pointer accent-[#0f2c4c]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="p-3 bg-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="p-3 bg-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between gap-3">
                  <Counter label="Adults" val={adults} setVal={setAdults} min={1} />
                  <Counter label="Children" val={children} setVal={setChildren} min={0} />
                  <Counter label="Rooms" val={rooms} setVal={setRooms} min={1} />
                </div>
                <button onClick={handleSearch} className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl text-sm">
                  Search Stays
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOTEL GRID */}
      <section id="hotels" className="max-w-7xl mx-auto px-4 md:px-16 py-12 md:py-20 bg-white/90 backdrop-blur-sm rounded-[30px] md:rounded-[50px] my-6 md:my-10 shadow-2xl">
        <div className="flex flex-col gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Top Rated Stays</h2>
            <p className="text-slate-500 font-medium">{processedHotels.length} hotels found</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white outline-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => setActiveCategory(c.name)}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${activeCategory === c.name ? "bg-[#0f2c4c] text-white shadow-md" : "bg-white text-slate-500 border border-slate-100 hover:border-slate-300"}`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-${i}`} className="bg-slate-100 rounded-[30px] h-80 animate-pulse"></div>
            ))}
          </div>
        ) : processedHotels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-2xl font-black text-slate-400">No hotels found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {processedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer"
                onClick={() => router.push(`/hotel/${hotel.id}`)}
              >
                <div className="relative h-52 overflow-hidden bg-slate-200">
                  <img
                    src={hotel.img}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-[#0f2c4c]/80 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {hotel.category}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-black shadow-lg">
                      ⭐ {hotel.rating}
                    </div>
                    {/* HEART BUTTON */}
                    <button
                      onClick={(e) => handleWishlist(e, hotel)}
                      disabled={wishlistLoading === hotel.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition text-sm ${wishlist.includes(hotel.id) ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
                    >
                      {wishlistLoading === hotel.id ? "..." : wishlist.includes(hotel.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-slate-900 mb-1">{hotel.name}</h3>
                  <p className="text-slate-400 text-sm font-bold mb-3">📍 {hotel.location}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(hotel.amenities || []).slice(0, 3).map((amenity: string) => (
                      <span key={`${hotel.id}-${amenity}`} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div>
                      <span className="text-xl font-black text-[#0f2c4c]">₹{hotel.price?.toLocaleString()}</span>
                      <span className="text-slate-400 text-xs font-bold">/night</span>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PACKAGES */}
      <section id="packages" className="bg-white/90 backdrop-blur-sm py-12 md:py-20 rounded-[30px] md:rounded-[50px] my-6 md:my-10 shadow-2xl mx-4 md:mx-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 italic">Holiday Packages</h2>
          <p className="text-slate-500 font-medium mb-8 md:mb-12">All-inclusive bundles for your dream vacation</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.title} className="bg-white p-5 md:p-8 rounded-[30px] shadow-lg flex flex-col items-start gap-4 text-left hover:scale-[1.02] transition cursor-pointer group border border-slate-100">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                  <img src={pkg.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={pkg.title} />
                  <span className="absolute top-3 left-3 bg-[#0f2c4c] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">{pkg.tag}</span>
                </div>
                <div className="w-full">
                  <h4 className="text-xl font-black mb-1 italic">{pkg.title}</h4>
                  <p className="text-sm text-slate-500 mb-2">{pkg.desc}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-black text-[#0f2c4c]">{pkg.price} <span className="text-sm text-slate-400 font-bold">/ person</span></p>
                    <span className="text-blue-600 font-black text-sm">View Details ➔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white/90 backdrop-blur-sm py-12 md:py-24 rounded-[30px] md:rounded-[50px] my-6 md:my-10 shadow-2xl mx-4 md:mx-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Since 2024</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-6 italic">About Kaha Jaoge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base">
              <span className="font-black text-slate-900">Kaha Jaoge</span> is more than a booking site — it&apos;s a promise of adventure. We bridge the gap between you and India&apos;s most stunning destinations.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base">
              We focus on curated experiences, ensuring that every room you book through us meets the highest standards of luxury and local charm.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-6">
                <p className="text-2xl md:text-4xl font-black text-[#0f2c4c]">{stat.num}</p>
                <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#0f2c4c] py-12 md:py-20 text-white rounded-t-[30px] md:rounded-t-[50px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 text-center">
            {contactItems.map((item, idx) => (
              <div key={item.title} className={`flex flex-col items-center gap-3 py-8 px-4 ${idx !== contactItems.length - 1 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}>
                <div className="bg-white/10 w-14 h-14 rounded-full flex items-center justify-center text-2xl">{item.icon}</div>
                <h4 className="font-black uppercase tracking-widest text-sm">{item.title}</h4>
                <p className="text-blue-200 text-sm">{item.val}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 pt-8 border-t border-white/10">
            <p className="text-white/50 text-sm font-bold mb-3">Are you a hotel owner?</p>
            <button
              onClick={() => router.push("/partner")}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition"
            >
              🏨 List Your Hotel
            </button>
          </div>
        </div>
      </section>

      {/* AI CHATBOT */}
      <div className="fixed bottom-4 right-3 md:bottom-8 md:right-8 z-[100]">
        {isBotOpen && (
          <div className="bg-white w-72 h-[380px] md:w-80 md:h-[500px] rounded-[20px] md:rounded-[30px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-3">
            <div className="bg-[#0f2c4c] p-3 md:p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-black">🤖</div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-[#0f2c4c]"></div>
                </div>
                <div>
                  <h4 className="font-black text-xs md:text-sm">Kaha Assistant</h4>
                  <p className="text-green-400 text-[9px] md:text-[10px] font-bold">● Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsBotOpen(false)} className="text-white/50 hover:text-white text-lg w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition">×</button>
            </div>

            {messages.length === 1 && (
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quick Questions</p>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map(q => (
                    <button key={q} onClick={() => sendQuickMessage(q)} className="text-[9px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-1 rounded-full hover:border-blue-400 hover:text-blue-600 transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-grow p-3 overflow-y-auto bg-slate-50 flex flex-col gap-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`max-w-[85%] p-2.5 rounded-2xl text-[11px] leading-relaxed ${msg.role === "bot" ? "bg-white text-slate-700 self-start shadow-sm border border-slate-100" : "bg-[#0f2c4c] text-white self-end shadow-md"}`}>
                  {msg.role === "bot" && <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Kaha AI</p>}
                  {msg.text}
                </div>
              ))}
              {botLoading && (
                <div className="bg-white self-start p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">Thinking...</span>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !botLoading && handleSendMessage()}
                placeholder="Ask about hotels..."
                className="flex-grow bg-slate-50 rounded-xl px-3 py-2 text-[11px] outline-none border border-slate-200 focus:border-blue-400 transition font-medium"
              />
              <button onClick={handleSendMessage} disabled={botLoading} className="bg-[#0f2c4c] text-white px-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 font-black text-sm">
                ➔
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsBotOpen(!isBotOpen)}
          className="bg-[#0f2c4c] w-12 h-12 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center text-lg md:text-2xl hover:scale-110 transition active:scale-95 group relative"
        >
          <span className="group-hover:rotate-12 transition-transform">{isBotOpen ? "❌" : "🤖"}</span>
          {!isBotOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>}
        </button>
      </div>

      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}

function Counter({ label, val, setVal, min }: any) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">{label}</label>
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 justify-center">
        <button onClick={() => setVal(Math.max(min, val - 1))} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 font-bold text-sm">-</button>
        <span className="text-sm font-black w-5 text-center">{val}</span>
        <button onClick={() => setVal(val + 1)} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 hover:text-green-500 font-bold text-sm">+</button>
      </div>
    </div>
  );
}