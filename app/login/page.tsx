"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { formatApiError } from "@/src/utils/apiError";
import { getGoogleIdToken } from "@/src/utils/googleAuth";
import { PasswordInput } from "@/components/PasswordInput";

function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = safeRedirect(searchParams.get("redirect"));

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      router.push(redirectTo);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const idToken = await getGoogleIdToken();
      await googleLogin(idToken);
      router.push(redirectTo);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex font-sans">
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"
          className="w-full h-full object-cover"
          alt="Hotel"
        />
        <div className="absolute inset-0 bg-[#0f2c4c]/70 flex flex-col justify-between p-16">
          <h2
            className="text-white text-3xl font-black italic tracking-tighter cursor-pointer"
            onClick={() => router.push("/")}
          >
            Kaha Jaoge
          </h2>
          <div>
            <p className="text-white text-5xl font-black italic tracking-tighter leading-tight mb-4">
              Welcome<br />Back!
            </p>
            <p className="text-blue-200 font-medium text-lg">
              Your next adventure is just one login away.
            </p>
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
            © 2024 Kaha Jaoge
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          <h2
            className="lg:hidden text-[#0f2c4c] text-2xl font-black italic tracking-tighter mb-10 cursor-pointer"
            onClick={() => router.push("/")}
          >
            Kaha Jaoge
          </h2>

          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Sign In</h1>
          <p className="text-slate-400 font-medium mb-10">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-blue-600 font-black cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-2xl mb-6">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-bold transition text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Password
              </label>
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-bold transition text-sm"
              />
              <div className="text-right mt-2">
                <span className="text-blue-600 text-xs font-black cursor-pointer hover:underline">
                  Forgot Password?
                </span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || googleLoading}
              className="w-full bg-[#0f2c4c] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-slate-400 text-xs font-bold uppercase">or</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:border-slate-400 transition active:scale-95 disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>
          </div>

          <p className="text-center text-slate-400 text-xs font-medium mt-10">
            By signing in, you agree to our{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">Terms</span> &{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#0f2c4c] font-black italic text-2xl animate-pulse">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
