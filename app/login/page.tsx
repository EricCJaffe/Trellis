"use client";
import { useState } from "react";

const COOKIE_NAME = "trellis_demo_auth";
const DEMO_PASSWORD = "ema2026";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(false);

    // Client-side check + set a readable cookie, then hard-navigate
    if (password === DEMO_PASSWORD) {
      document.cookie = `${COOKIE_NAME}=${DEMO_PASSWORD}; path=/; max-age=604800; SameSite=Lax`;
      window.location.href = "/";
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#143637" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3" style={{ background: "#143637" }}>
            T
          </div>
          <div className="text-2xl font-bold mb-0.5" style={{ color: "#143637" }}>Trellis</div>
          <div className="text-gray-500 text-sm">Every Mother's Advocate</div>
          <div className="mt-3 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            ✦ Demo Environment
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Demo Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "#143637" } as React.CSSProperties}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Incorrect password. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "#143637" }}
          >
            {loading ? "Entering…" : "Enter Demo →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          For authorized preview only — all data is fictional
        </p>
      </div>
    </div>
  );
}
