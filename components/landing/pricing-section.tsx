"use client";

import Link from "next/link";

const features = [
  "Legal assistant — permits, disputes, tenant rights",
  "Credit assistant — debt handling, bank access, budgeting",
  "Health assistant — clinic access, rights, referrals",
  "Education assistant — NSFAS, upskilling, school access",
  "Opportunity assistant — jobs, grants, local resources",
  "Secure encrypted Vault for your documents",
  "One free SpotMe pass for a friend",
];

export function PricingSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[480px] mx-auto">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] px-3 py-1 rounded-full bg-black/6 text-black/50 tracking-widest uppercase">Pricing</span>
        </div>
        <h2 className="font-serif font-normal text-3xl text-center text-[#0f0f0f] mb-2">One flat price, no surprises</h2>
        <p className="text-center text-sm text-black/50 mb-10">No SA ID required. No subscription, ever.</p>

        <div className="border-2 border-[#0f0f0f] rounded-2xl p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-medium text-[#0f0f0f]">Kommune Access</div>
              <div className="text-xs text-black/45 mt-0.5">Everything, once-off</div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#0f0f0f] text-white">Most chosen</span>
          </div>
          <div className="mb-5">
            <span className="text-4xl font-medium text-[#0f0f0f]">R300</span>
            <span className="text-sm text-black/45 ml-1">once-off</span>
          </div>
          <div className="flex flex-col gap-2.5 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-black/60">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="7" cy="7" r="7" fill="#0f0f0f"/><polyline points="4,7 6,9 10,5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {f}
              </div>
            ))}
          </div>
          <Link href="/activate" className="flex items-center justify-center w-full h-11 rounded-full bg-[#0f0f0f] text-white text-sm font-medium">
            Start my journey
          </Link>
        </div>

        <div className="rounded-2xl p-5 flex items-center gap-4" style={{background: "linear-gradient(120deg, #e8d8f5, #d8e8f5, #f5e8d8)"}}>
          <div className="w-9 h-9 rounded-full bg-[#0f0f0f] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <div className="text-sm font-medium text-[#0f0f0f]">Not sure where to start?</div>
            <div className="text-xs text-black/55 mt-0.5">Message us free — no payment needed first.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
