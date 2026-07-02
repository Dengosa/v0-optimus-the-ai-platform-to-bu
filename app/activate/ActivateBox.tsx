"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const WHATSAPP_NUMBER = "27796463376";
const WHATSAPP_MSG = encodeURIComponent("Hi Kommune, I want to activate my account.");

export function ActivateBox() {
  const [tab, setTab] = useState<"whatsapp" | "email">("whatsapp");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function handleEmailSubmit() {
    if (!email) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/activate/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <span className="font-medium text-[#0f0f0f]">Kommune</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#0f0f0f] text-white">Made for you</span>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-black/5 rounded-full p-1">
          <button onClick={() => setTab("whatsapp")} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${tab === "whatsapp" ? "bg-white text-[#0f0f0f] shadow-sm" : "text-black/40"}`}>WhatsApp</button>
          <button onClick={() => setTab("email")} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${tab === "email" ? "bg-white text-[#0f0f0f] shadow-sm" : "text-black/40"}`}>Email</button>
        </div>
      </div>

      <h1 className="font-serif text-3xl text-center leading-snug text-[#0f0f0f] mb-2">
        One conversation,<br />every system involved.
      </h1>
      <p className="text-center text-sm text-black/50 mb-6">
        Legal, credit, health and education assistants working for you from day one.
      </p>

      <div className="bg-black/[0.03] rounded-xl p-4 mb-4 flex gap-3">
        <span className="text-black/20 text-lg leading-none">&ldquo;</span>
        <div>
          <p className="text-xs text-[#0f0f0f] leading-relaxed">While I wait, Kommune got me into school and helped me open a bank account without an ID. I am not stuck anymore.</p>
          <p className="text-[10.5px] text-black/40 mt-1">Khaya, 22 — South Africa</p>
        </div>
      </div>

      <div className="bg-white border border-black/10 rounded-xl px-4 py-3 flex justify-between items-center mb-4">
        <div>
          <div className="text-xs text-black/50">One-time activation</div>
          <div className="text-[10.5px] text-black/40 mt-0.5">EFT · 5 assistants · 1 SpotMe pass</div>
        </div>
        <span className="text-xl font-medium text-[#0f0f0f]">R300</span>
      </div>

      {tab === "whatsapp" ? (
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#0f0f0f] text-white text-sm font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Start on WhatsApp
        </a>
      ) : submitted ? (
        <div className="text-center text-sm text-green-600 py-3">Submitted — we will send payment details shortly.</div>
      ) : (
        <div className="flex flex-col gap-2">
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none bg-black/[0.02]" />
          <button onClick={handleEmailSubmit} disabled={loading} className="w-full h-12 rounded-full bg-[#0f0f0f] text-white text-sm font-medium">{loading ? "Sending..." : "Request activation"}</button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-black/30" />
        <p className="text-[11px] text-black/40">We never ask for payment before you message us.</p>
      </div>
    </div>
  );
}

