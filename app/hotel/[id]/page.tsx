"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/src/hooks/useAuth";

const HOTELS: any[] = [
  {
    id: "local-1",
    name: "Taj Mahal Palace",
    location: "Mumbai",
    category: "Luxury",
    rating: 4.9,
    price: 12000,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Spa", "Concierge"],
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    description: "The iconic Taj Mahal Palace stands majestically at the Gateway of India in Mumbai. A symbol of Indian hospitality, this legendary hotel has welcomed royalty, dignitaries and discerning travellers for over a century.",
  },
  {
    id: "local-2",
    name: "Leela Palace",
    location: "Delhi",
    category: "Luxury",
    rating: 4.8,
    price: 9500,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Gym"],
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    description: "The Leela Palace New Delhi is an ultra-luxury hotel located in the heart of the diplomatic enclave. With its grand architecture inspired by Lutyens Delhi, it offers unmatched elegance and world-class service.",
  },
  {
    id: "local-3",
    name: "Goa Beach Resort",
    location: "Goa",
    category: "Beach",
    rating: 4.5,
    price: 5500,
    amenities: ["Free WiFi", "Beach Access", "Pool", "Bar"],
    img: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800",
    description: "Nestled on the pristine shores of North Goa, this beach resort offers a perfect blend of sun, sand and luxury. Wake up to the sound of waves and enjoy world-class amenities just steps from the beach.",
  },
  {
    id: "local-4",
    name: "The Oberoi Amarvilas",
    location: "Agra",
    category: "Heritage",
    rating: 4.9,
    price: 18000,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Spa", "Taj View"],
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    description: "Every room and suite at Oberoi Amarvilas has a view of the Taj Mahal. Located just 600 metres from one of the worlds greatest monuments, this is the most perfectly located luxury hotel in India.",
  },
  {
    id: "local-5",
    name: "Wildflower Hall",
    location: "Shimla",
    category: "Mountain",
    rating: 4.7,
    price: 8000,
    amenities: ["Free WiFi", "Spa", "Breakfast", "Trekking"],
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    description: "Set amidst cedar forests at an altitude of 8250 feet in the Himalayas, Wildflower Hall is one of Indias most breathtaking mountain retreats.",
  },
  {
    id: "local-6",
    name: "Umaid Bhawan Palace",
    location: "Jodhpur",
    category: "Heritage",
    rating: 4.8,
    price: 15000,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Museum", "Spa"],
    img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
    description: "One of the worlds largest private residences, Umaid Bhawan Palace is a magnificent Art Deco masterpiece offering a royal Rajasthani experience.",
  },
  {
    id: "local-7",
    name: "Zuri Kumarakom",
    location: "Kerala",
    category: "Beach",
    rating: 4.6,
    price: 7000,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Ayurveda", "Backwaters"],
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    description: "Nestled on the banks of Vembanad Lake in Keralas backwaters, Zuri Kumarakom offers a serene escape amidst lush greenery and tranquil waters.",
  },
  {
    id: "local-8",
    name: "The LaLiT Resort",
    location: "Manali",
    category: "Mountain",
    rating: 4.4,
    price: 6000,
    amenities: ["Free WiFi", "Fireplace", "Breakfast", "Skiing"],
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    description: "Perched in the majestic Kullu Valley with the mighty Himalayas as a backdrop, The LaLiT Resort Manali is a perfect mountain escape.",
  },
  {
    id: "local-9",
    name: "ITC Grand Chola",
    location: "Chennai",
    category: "Luxury",
    rating: 4.7,
    price: 8500,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Gym", "Spa"],
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    description: "ITC Grand Chola is a tribute to the magnificent Chola Empire. This LEED Platinum certified hotel in Chennai is one of the largest luxury hotels in India.",
  },
  {
    id: "local-10",
    name: "Alila Fort Bishangarh",
    location: "Jaipur",
    category: "Heritage",
    rating: 4.8,
    price: 14000,
    amenities: ["Free WiFi", "Pool", "Breakfast", "Fort View", "Spa"],
    img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
    description: "Perched atop a 230-year-old fort in the Aravalli Hills, Alila Fort Bishangarh is a stunning heritage hotel near Jaipur.",
  }
];

const ROOM_TYPES = [
  { type: "Deluxe Room", desc: "Spacious room with king-size bed, city view and premium amenities.", multiplier: 1, icon: "🛏️", size: "45 sqm", guests: 2 },
  { type: "Premium Suite", desc: "Separate living area, panoramic views, butler service included.", multiplier: 1.8, icon: "👑", size: "90 sqm", guests: 3 },
  { type: "Luxury Villa", desc: "Private pool, personal butler, fully exclusive villa experience.", multiplier: 2.5, icon: "🏡", size: "150 sqm", guests: 4 },
];

export default function HotelDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePhoto, setActivePhoto] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "reviews" | "map">("overview");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // COUPON
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // WISHLIST
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // REVIEWS
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const basePrice = hotel ? Math.round(hotel.price * ROOM_TYPES[selectedRoom].multiplier * nights) : 0;
  const totalPrice = basePrice - appliedDiscount;

  useEffect(() => {
    const found = HOTELS.find(h => h.id === id);
    if (found) {
      setHotel(found);
      setActivePhoto(found.img);
      setLoading(false);
    } else {
      const supabaseId = String(id).replace("remote-", "");
      async function fetchFromSupabase() {
        const { data } = await supabase.from("hotels").select("*").eq("id", supabaseId).single();
        if (data) { setHotel({ ...data }); setActivePhoto(data.img); }
        setLoading(false);
      }
      fetchFromSupabase();
    }

    fetch("/api/reviews/get?hotel_id=" + id)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); });
  }, [id]);

  useEffect(() => {
    if (authLoading || !user?.id || !id) {
      if (!authLoading && !user) setIsWishlisted(false);
      return;
    }
    let cancelled = false;
    async function loadWishlist() {
      const res = await fetch("/api/wishlist/get?user_id=" + user!.id);
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setIsWishlisted(data.some((w: any) => w.hotel_id === id));
      }
    }
    void loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [user?.id, id, authLoading]);

  const handleWishlist = async () => {
    if (!user) { router.push("/login"); return; }
    setWishlistLoading(true);
    const res = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        hotel_id: id,
        hotel_name: hotel.name,
        hotel_img: hotel.img,
        hotel_location: hotel.location,
        hotel_price: hotel.price,
        hotel_rating: hotel.rating,
      }),
    });
    const data = await res.json();
    setIsWishlisted(data.action === "added");
    setWishlistLoading(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, booking_amount: basePrice }),
    });
    const data = await res.json();
    setCouponResult(data);
    if (data.valid) setAppliedDiscount(data.discount_amount);
    else setAppliedDiscount(0);
    setCouponLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) { router.push("/login"); return; }
    if (!reviewText.trim()) { alert("Please write a review!"); return; }
    setReviewLoading(true);
    await fetch("/api/reviews/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotel_id: id,
        hotel_name: hotel.name,
        user_id: user.id,
        user_name: user.fullName || user.email?.split("@")[0],
        rating: reviewRating,
        comment: reviewText,
      }),
    });
    const newReview = {
      id: Date.now(),
      user_name: user.fullName || user.email?.split("@")[0],
      rating: reviewRating,
      comment: reviewText,
      created_at: new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);
    setReviewText("");
    setReviewRating(5);
    setReviewLoading(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handlePayment = async () => {
    if (!guestName || !email) { alert("Please fill in your name and email"); return; }
    setBookingLoading(true);
    const bookingRef = "KJ" + Date.now().toString().slice(-8).toUpperCase();
    try {
      if (user?.id) {
        await supabase.from("bookings").insert({
          hotel_name: hotel.name,
          hotel_id: String(hotel.id),
          guest_name: guestName,
          guest_email: email,
          guest_phone: phone,
          room_type: ROOM_TYPES[selectedRoom].type,
          check_in: checkIn,
          check_out: checkOut,
          nights,
          total_price: totalPrice,
          booking_ref: bookingRef,
          user_id: user.id,
          status: "confirmed",
        });
      }

      // ✅ SEND CONFIRMATION EMAIL
      await fetch("/api/email/booking-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: email,
          hotel_name: hotel.name,
          room_type: ROOM_TYPES[selectedRoom].type,
          check_in: checkIn,
          check_out: checkOut,
          nights: nights,
          total_price: totalPrice,
          booking_ref: bookingRef,
        }),
      });

    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setBookingLoading(false);
    }
    router.push(`/success?hotel=${encodeURIComponent(hotel.name)}&price=${totalPrice}&name=${encodeURIComponent(guestName)}&nights=${nights}&room=${encodeURIComponent(ROOM_TYPES[selectedRoom].type)}&checkin=${checkIn}&checkout=${checkOut}&ref=${bookingRef}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Kaha Jaoge...
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex items-center justify-center font-black uppercase text-2xl">
      Stay not found.
      <button onClick={() => router.push("/")} className="ml-4 text-blue-600 underline">Go Back</button>
    </div>
  );

  const gallery = [
    { url: hotel.img, label: "Exterior" },
    { url: hotel.photo_room || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", label: "Room" },
    { url: hotel.photo_bathroom || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", label: "Bathroom" },
    { url: hotel.photo_reception || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", label: "Reception" },
  ];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating;

  const tabs = ["overview", "rooms", "reviews", "map"] as const;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

        {/* GALLERY + BOOKING */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="flex flex-col gap-4">
            <div className="relative h-[420px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              <img src={activePhoto} className="w-full h-full object-cover transition duration-500" alt="Main View" />
              <div className="absolute top-5 left-5 bg-[#0f2c4c]/80 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                {hotel.category}
              </div>
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition text-lg ${isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
              >
                {wishlistLoading ? "..." : isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((photo) => (
                <div key={photo.label} className="flex flex-col gap-1">
                  <button onClick={() => setActivePhoto(photo.url)} className={`h-20 rounded-2xl overflow-hidden border-4 transition-all ${activePhoto === photo.url ? "border-blue-500 scale-95 shadow-lg" : "border-white hover:border-slate-300"}`}>
                    <img src={photo.url} className="w-full h-full object-cover" alt={photo.label} />
                  </button>
                  <span className={`text-[9px] text-center font-black uppercase tracking-widest ${activePhoto === photo.url ? "text-blue-500" : "text-slate-400"}`}>{photo.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOOKING CARD */}
          <div className="flex flex-col gap-4">
            <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">{hotel.category} Stay</span>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">{hotel.name}</h1>
            <p className="text-slate-400 font-bold text-lg">📍 {hotel.location}, India</p>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full font-black text-sm">⭐ {avgRating} / 5</span>
              <span className="bg-green-50 text-green-600 px-4 py-2 rounded-full font-black text-sm">✓ Verified Property</span>
              {reviews.length > 0 && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black text-sm">{reviews.length} Reviews</span>}
            </div>

            <div className="bg-white p-6 rounded-[28px] shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Starting from</p>
                  <span className="text-4xl font-black text-[#0f2c4c]">₹{hotel.price?.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm font-bold">/night</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total ({nights} night{nights > 1 ? "s" : ""})</p>
                  {appliedDiscount > 0 ? (
                    <div>
                      <p className="text-slate-400 text-sm font-bold line-through">₹{basePrice.toLocaleString()}</p>
                      <p className="text-2xl font-black text-green-600">₹{totalPrice.toLocaleString()}</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-black text-blue-600">₹{basePrice.toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Check-in</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Check-out</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              {/* COUPON */}
              <div className="mb-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">🏷️ Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setAppliedDiscount(0); }}
                    className="flex-grow p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                  />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="bg-[#0f2c4c] text-white px-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-50">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponResult && (
                  <div className={`mt-2 p-3 rounded-xl text-xs font-bold ${couponResult.valid ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    {couponResult.message}
                    {couponResult.valid && <span className="ml-2">You save ₹{couponResult.discount_amount?.toLocaleString()}!</span>}
                  </div>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["WELCOME20", "KAHA10", "SUMMER30", "FIRST50"].map(code => (
                    <button key={code} onClick={() => { setCouponCode(code); setCouponResult(null); setAppliedDiscount(0); }} className="text-[9px] bg-blue-50 text-blue-600 font-black px-2 py-1 rounded-lg hover:bg-blue-100 transition border border-blue-200">
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full bg-[#0f2c4c] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg active:scale-95">
                  Book Now — ₹{totalPrice.toLocaleString()}
                </button>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setShowForm(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition">← Back</button>
                  <input type="text" placeholder="Full Name *" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" value={guestName} onChange={e => setGuestName(e.target.value)} />
                  <input type="email" placeholder="Email Address *" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" value={email} onChange={e => setEmail(e.target.value)} />
                  <input type="tel" placeholder="Phone (+91)" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
                  {appliedDiscount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-green-700 font-black text-sm">🎉 Coupon applied! You save ₹{appliedDiscount.toLocaleString()}</p>
                      <p className="text-green-600 text-xs font-bold">Final: ₹{totalPrice.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-blue-700 font-bold text-xs">📧 Booking confirmation will be sent to your email!</p>
                  </div>
                  <button onClick={handlePayment} disabled={bookingLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#0f2c4c] transition shadow-lg disabled:opacity-60">
                    {bookingLoading ? "Booking & Sending Email..." : `Confirm & Pay ₹${totalPrice.toLocaleString()}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-black text-sm uppercase tracking-widest whitespace-nowrap transition border-b-2 -mb-[2px] ${activeTab === tab ? "border-[#0f2c4c] text-[#0f2c4c]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab === "overview" ? "🏨 Overview" : tab === "rooms" ? "🛏️ Rooms" : tab === "reviews" ? `⭐ Reviews (${reviews.length})` : "🗺️ Map"}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-black mb-4">About This Property</h2>
              <p className="text-slate-600 leading-relaxed font-medium text-lg mb-8">{hotel.description || "A wonderful hotel experience awaits you."}</p>
              <h3 className="text-xl font-black mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(hotel.amenities || []).map((item: string) => (
                  <div key={item} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-sm">✓</div>
                    <span className="text-sm font-black text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-4">Property Highlights</h3>
                <div className="space-y-3">
                  {[
                    { icon: "📍", label: "Location", val: hotel.location },
                    { icon: "⭐", label: "Rating", val: `${avgRating} / 5` },
                    { icon: "🏷️", label: "Category", val: hotel.category },
                    { icon: "💰", label: "Price/Night", val: `₹${hotel.price?.toLocaleString()}` },
                    { icon: "✅", label: "Free Cancellation", val: "Before 24hrs" },
                    { icon: "🏷️", label: "Coupons", val: "Available!" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-400 text-sm font-bold">{item.icon} {item.label}</span>
                      <span className="text-slate-900 text-sm font-black">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AVAILABLE COUPONS */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-[24px] border border-blue-100">
                <h3 className="font-black text-sm uppercase tracking-widest text-blue-600 mb-3">🏷️ Available Coupons</h3>
                <div className="space-y-2">
                  {[
                    { code: "WELCOME20", desc: "20% off on all bookings" },
                    { code: "KAHA10", desc: "10% off — min ₹500" },
                    { code: "SUMMER30", desc: "30% off — min ₹5000" },
                    { code: "FIRST50", desc: "50% off first booking!" },
                  ].map(c => (
                    <div key={c.code} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100">
                      <div>
                        <p className="font-black text-[#0f2c4c] text-sm">{c.code}</p>
                        <p className="text-slate-400 text-xs font-bold">{c.desc}</p>
                      </div>
                      <button onClick={() => { setCouponCode(c.code); setCouponResult(null); setAppliedDiscount(0); }} className="text-xs bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROOMS */}
        {activeTab === "rooms" && (
          <div>
            <h2 className="text-2xl font-black mb-6">Choose Your Room</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {ROOM_TYPES.map((room, i) => (
                <div key={room.type} onClick={() => setSelectedRoom(i)} className={`bg-white p-6 rounded-[28px] border-2 cursor-pointer transition-all hover:shadow-xl ${selectedRoom === i ? "border-blue-500 shadow-xl scale-[1.02]" : "border-slate-100 hover:border-slate-300"}`}>
                  <div className="text-4xl mb-4">{room.icon}</div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black">{room.type}</h3>
                    {selectedRoom === i && <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Selected</span>}
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-4">{room.desc}</p>
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-3 py-1 rounded-full uppercase">{room.size}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-3 py-1 rounded-full uppercase">{room.guests} Guests</span>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-2xl font-black text-[#0f2c4c]">₹{Math.round(hotel.price * room.multiplier).toLocaleString()}</span>
                    <span className="text-slate-400 text-xs font-bold">/night</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="bg-white p-8 rounded-[28px] shadow-sm border border-slate-100 w-full md:w-64 shrink-0 text-center h-fit">
                <p className="text-7xl font-black text-[#0f2c4c]">{avgRating}</p>
                <div className="text-2xl my-2">{"⭐".repeat(Math.round(Number(avgRating)))}</div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">out of 5</p>
                <p className="text-slate-400 font-bold text-sm mt-2">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Cleanliness", val: 95 },
                    { label: "Location", val: 98 },
                    { label: "Service", val: 96 },
                    { label: "Value", val: 88 },
                  ].map(item => (
                    <div key={item.label} className="text-left">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>{item.label}</span><span>{item.val}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0f2c4c] rounded-full" style={{ width: `${item.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-grow">
                <div className="bg-slate-50 p-6 rounded-[24px] border-2 border-dashed border-slate-200">
                  <p className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4">✍️ Write a Review</p>
                  <div className="flex gap-2 mb-3">
                    <p className="text-slate-400 font-bold text-sm">Your Rating:</p>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)} className={`text-2xl transition hover:scale-110 ${star <= reviewRating ? "text-amber-400" : "text-slate-200"}`}>★</button>
                    ))}
                  </div>
                  <textarea placeholder="Share your experience..." value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full p-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium resize-none h-24 border border-slate-100" />
                  {reviewSuccess && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 font-bold text-sm">✅ Review submitted!</p>
                    </div>
                  )}
                  <button onClick={handleSubmitReview} disabled={reviewLoading} className="mt-3 bg-[#0f2c4c] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-60">
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-[24px] border border-slate-100">
                    <p className="text-4xl mb-3">✍️</p>
                    <p className="font-black text-slate-400">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0f2c4c] rounded-full flex items-center justify-center text-white font-black text-sm">
                            {(review.user_name || "G").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm">{review.user_name}</p>
                            <p className="text-slate-400 text-xs font-bold">
                              {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={star <= review.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MAP */}
        {activeTab === "map" && (
          <div>
            <h2 className="text-2xl font-black mb-6">Location — {hotel.location}, India</h2>
            <div className="rounded-[28px] overflow-hidden shadow-xl border-4 border-white h-[450px] bg-slate-200">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + " " + hotel.location + " India")}&output=embed&z=14`}
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-4 flex gap-4 flex-wrap">
              {[
                { icon: "✈️", title: "Nearest Airport", val: `${hotel.location} International Airport` },
                { icon: "🚇", title: "Public Transport", val: "Metro & Cab Available" },
                { icon: "🚗", title: "Airport Transfer", val: "Available on Request" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-black text-sm">{item.title}</p>
                    <p className="text-slate-400 text-xs font-bold">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}