"use client";

import { useState } from "react";
import { getGoogleIdToken } from "@/src/utils/googleAuth";

/**
 * Dev-only helper: capture a real Google ID token for E2E verification.
 * Visit http://localhost:3000/dev/google-token
 */
export default function GoogleTokenCapturePage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const capture = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const idToken = await getGoogleIdToken();
      setToken(idToken);
      const res = await fetch("/api/dev/google-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, label: "primary" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to save token");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg border border-slate-100 p-10 space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">
            Dev / QA
          </p>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Capture Google ID Token
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Sign in with Google. The ID token is saved for the backend E2E suite.
            Re-click to capture a fresh token when needed.
          </p>
        </div>

        <button
          type="button"
          onClick={capture}
          disabled={saving}
          className="w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-60"
        >
          {saving ? "Waiting for Google…" : "Sign in with Google"}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-3 rounded-2xl">
            Token saved. You can return to the verification script.
          </div>
        )}

        {token && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Token (truncated)
            </p>
            <pre className="text-xs bg-slate-100 p-4 rounded-2xl overflow-x-auto break-all whitespace-pre-wrap">
              {token.slice(0, 80)}…
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
