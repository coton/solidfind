"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="w-full max-w-[360px] bg-white rounded-[12px] border border-[#e4e4e4] p-8">
        <div className="text-center mb-8">
          <h1 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">
            SolidFind
          </h1>
          <p className="text-[11px] text-[#333]/50 mt-1">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-[#333]/60 mb-1.5 tracking-[0.2px]">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 px-3 bg-[#fafafa] border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#333]/60 mb-1.5 tracking-[0.2px]">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-[#fafafa] border border-[#e4e4e4] rounded-[6px] text-[13px] text-[#333] outline-none focus:border-[#333] transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#333] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#555] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
