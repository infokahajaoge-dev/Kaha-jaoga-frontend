"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { formatApiError } from "@/src/utils/apiError";

type VerifyState = "loading" | "success" | "failure";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const started = useRef(false);

  const [state, setState] = useState<VerifyState>(token ? "loading" : "failure");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "Invalid or expired verification link."
  );
  const [resendEmail, setResendEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    let cancelled = false;

    async function verify() {
      try {
        await authService.verifyEmail({ token: token! });
        if (!cancelled) setState("success");
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            formatApiError(err) || "Invalid or expired verification link."
          );
          setState("failure");
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      setResendError("Please enter your email address.");
      return;
    }
    setResendLoading(true);
    setResendError("");
    setResendFeedback("");
    try {
      const result = await authService.resendVerification({
        email: resendEmail.trim(),
      });
      setResendFeedback(
        result.message || "Verification email sent successfully."
      );
    } catch (err) {
      setResendError(formatApiError(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f2c4c] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[50px] p-12 text-center max-w-md w-full shadow-2xl">
        {state === "loading" && (
          <>
            <div
              className="w-16 h-16 border-4 border-slate-200 border-t-[#0f2c4c] rounded-full animate-spin mx-auto mb-8"
              aria-hidden
            />
            <h1 className="text-3xl font-black italic tracking-tighter text-[#0f2c4c] mb-3">
              Verifying your email
            </h1>
            <p className="text-slate-400 font-medium">
              Please wait while we confirm your account…
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter text-[#0f2c4c] mb-3">
              Email verified
            </h1>
            <p className="text-slate-400 font-medium mb-8">
              Your account is active. You can sign in now.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition"
            >
              Continue to Login →
            </button>
          </>
        )}

        {state === "failure" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter text-[#0f2c4c] mb-3">
              Verification failed
            </h1>
            <p className="text-slate-400 font-medium mb-8">{errorMessage}</p>

            {showResend ? (
              <div className="space-y-3 text-left mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
                />
                {resendError && (
                  <p className="text-red-500 text-sm font-bold">{resendError}</p>
                )}
                {resendFeedback && (
                  <p className="text-green-600 text-sm font-bold">{resendFeedback}</p>
                )}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-60"
                >
                  {resendLoading ? "Sending..." : "Send Verification Email"}
                </button>
              </div>
            ) : null}

            <div className="space-y-3">
              {!showResend && (
                <button
                  type="button"
                  onClick={() => setShowResend(true)}
                  className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition"
                >
                  Resend Verification
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-slate-400 transition"
              >
                Go to Signup
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-slate-400 transition"
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0f2c4c] flex items-center justify-center p-6">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
