"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const displayName = user?.fullName
    ? user.fullName.split(" ")[0]
    : user?.email?.split("@")[0];

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase();

  return (
    <nav className="bg-[#0f2c4c] text-white px-6 md:px-16 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">

      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
        <div className="bg-white p-1.5 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-auto"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase italic">Kaha Jaoge</h2>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
        <Link href="/" className="hover:text-blue-400 transition">Home</Link>
        <Link href="/#hotels" className="hover:text-blue-400 transition">Hotels</Link>
        <Link href="/#packages" className="hover:text-blue-400 transition">Packages</Link>
        <Link href="/#about" className="hover:text-blue-400 transition">About Us</Link>

        <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

        {loading ? (
          <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse"></div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
            >
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-black">
                {initials}
              </div>
              <span className="text-sm font-black capitalize">{displayName}</span>
              <span className="text-white/50 text-xs">{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-14 bg-white text-slate-900 rounded-[20px] shadow-2xl border border-slate-100 w-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <p className="font-black text-sm capitalize">{displayName}</p>
                  <p className="text-slate-400 text-xs font-medium truncate">{user.email}</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => { router.push("/account"); setDropdownOpen(false); }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <span>👤</span> My Account
                  </button>
                  <button
                    onClick={() => { router.push("/bookings"); setDropdownOpen(false); }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <span>🗓️</span> My Bookings
                  </button>
                  <button
                    onClick={() => { router.push("/wishlist"); setDropdownOpen(false); }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <span>❤️</span> My Wishlist
                  </button>
                </div>

                <div className="border-t border-slate-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="hover:text-blue-400 transition font-bold"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full transition shadow-lg active:scale-95"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      <button className="lg:hidden text-white p-2 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✕" : "☰"}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0f2c4c] border-t border-white/10 px-6 py-6 flex flex-col gap-4 lg:hidden shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400">Home</Link>
          <Link href="/#hotels" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400">Hotels</Link>
          <Link href="/#packages" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400">Packages</Link>
          <Link href="/#about" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400">About Us</Link>
          <div className="border-t border-white/10 pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center font-black text-sm">{initials}</div>
                  <div>
                    <p className="font-black text-sm capitalize">{displayName}</p>
                    <p className="text-blue-300 text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { router.push("/account"); setMenuOpen(false); }} className="text-sm font-bold hover:text-blue-400 text-left">👤 My Account</button>
                <button onClick={() => { router.push("/bookings"); setMenuOpen(false); }} className="text-sm font-bold hover:text-blue-400 text-left">🗓️ My Bookings</button>
                <button onClick={() => { router.push("/wishlist"); setMenuOpen(false); }} className="text-sm font-bold hover:text-blue-400 text-left">❤️ My Wishlist</button>
                <button onClick={handleLogout} className="text-sm font-black text-red-400 text-left">🚪 Logout</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => router.push("/login")} className="flex-1 border border-white/30 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition">Login</button>
                <button onClick={() => router.push("/signup")} className="flex-1 bg-blue-600 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}

      {dropdownOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  );
}
