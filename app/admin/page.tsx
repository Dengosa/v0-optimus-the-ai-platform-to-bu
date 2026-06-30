"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// No secret stored here. The password the user types IS the secret —
// it gets sent directly to the backend which validates it server-side.
// If wrong, backend returns 401. Nothing sensitive lives in this bundle.

type Activation = {
  reference: string;
  email: string | null;
  whatsapp_number: string | null;
  status: string;
  spotted_by: string | null;
  spotme_used: boolean;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("pending");

  const login = async () => {
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/activations`, {
        headers: { "x-admin-secret": password },
      });
      if (res.ok) {
        const data = await res.json();
        setSecret(password);
        setAuthed(true);
        setActivations(data);
      } else if (res.status === 401) {
        setMessage("Wrong password");
      } else {
        setMessage(`Server error: ${res.status}`);
      }
    } catch {
      setMessage("Cannot reach backend — is it running?");
    }
  };

  const fetchActivations = async () => {
    if (!secret) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/activations`, {
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        setActivations(await res.json());
      } else {
        setMessage("Failed to fetch — session may have expired");
      }
    } catch {
      setMessage("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const confirmActivation = async (reference: string) => {
    if (!secret) return;
    setConfirming(reference);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/activate-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ reference }),
      });
      if (res.ok) {
        setMessage(`✅ ${reference} activated`);
        fetchActivations();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(`❌ Failed: ${err.detail || res.status}`);
      }
    } catch {
      setMessage("Connection error");
    } finally {
      setConfirming(null);
    }
  };

  const filtered = activations.filter(a =>
    filter === "all" ? true : a.status === filter
  );

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="rounded-2xl border border-foreground/10 bg-background p-8 w-full max-w-sm">
          <h1 className="text-2xl font-display mb-2">Kommune Admin</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your admin password to continue.</p>
          <input
            type="password"
            placeholder="Admin password"
            className="w-full rounded-xl border border-foreground/10 bg-secondary/30 px-4 py-3 text-sm outline-none mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            autoFocus
          />
          {message && <div className="text-sm text-red-500 mb-4">{message}</div>}
          <Button onClick={login} className="w-full bg-foreground text-background rounded-full">
            Login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/20 p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display">Kommune Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activations.filter(a => a.status === "pending").length} pending ·{" "}
              {activations.filter(a => a.status === "confirmed").length} confirmed
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchActivations} variant="outline" className="rounded-full" disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button onClick={() => { setAuthed(false); setSecret(null); setPassword(""); }} variant="outline" className="rounded-full">
              Logout
            </Button>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-foreground/10 bg-background p-4 mb-6 text-sm">
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {(["pending", "confirmed", "all"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border capitalize ${
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "border-foreground/10 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background overflow-hidden">
          <div className="p-6 border-b border-foreground/10">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Activations — {filtered.length} shown
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No activations in this view.</div>
          ) : (
            <div className="divide-y divide-foreground/10">
              {filtered.map((a) => (
                <div key={a.reference} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="font-mono text-sm font-bold">{a.reference}</div>
                    <div className="text-sm text-muted-foreground">
                      {a.email || a.whatsapp_number || "No contact info"}
                    </div>
                    {a.spotted_by && (
                      <div className="text-xs text-green-600">SpotMe — spotted by {a.spotted_by}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs px-3 py-1 rounded-full border ${
                      a.status === "confirmed"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}>
                      {a.status}
                    </span>
                    {a.status === "pending" && (
                      <Button
                        onClick={() => confirmActivation(a.reference)}
                        disabled={confirming === a.reference}
                        className="bg-foreground text-background rounded-full text-sm h-9 px-4"
                      >
                        {confirming === a.reference ? "Confirming..." : "Confirm payment"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
