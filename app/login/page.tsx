"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D1B69] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-[#2D1B69] mb-1">Trellis</div>
          <div className="text-gray-500 text-sm">Every Mother's Advocate</div>
          <div className="mt-3 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            ✦ Demo Environment
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#2D1B69] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-900 transition-colors disabled:opacity-50"
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
