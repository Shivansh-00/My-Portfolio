"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError("Invalid credentials");
      return;
    }

    const data = (await response.json()) as { token: string };
    setToken(data.token);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      {!token ? (
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white"
            onClick={handleLogin}
          >
            Sign in
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="section-card">
          <p className="text-sm text-slate-300">
            Token acquired. Use this token to access protected admin endpoints.
          </p>
        </div>
      )}
    </main>
  );
}
