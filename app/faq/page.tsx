"use client";

import { useState } from "react";

const faqs = [
  { q: "Do I need a South African ID?", a: "No. Kommune works with just a passport or asylum permit from day one. No SA ID required at any point." },
  { q: "How long until I am activated?", a: "Usually within 24 hours of payment confirmation. We will send you a message on WhatsApp or email once you are active." },
  { q: "Is my information shared with Home Affairs?", a: "No, not proactively. Kommune does not report your status or documents to Home Affairs, police, or any immigration authority. See our privacy page for the full details." },
  { q: "What if I do not have a bank card?", a: "Pay by manual EFT to our account. We will send you the banking details after you message us. No card needed." },
  { q: "Can I get a refund?", a: "Yes. If you are not activated within 48 hours of payment, or we cannot help with your case at all, email hello@kommune.app for a full refund." },
  { q: "What is the SpotMe pass?", a: "Every activation includes one free SpotMe pass you can give to a friend. They get full access without paying the R300 themselves." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="relative min-h-screen bg-[#ececea]">
      <div className="max-w-[560px] mx-auto px-6 pt-28 pb-20">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] px-3 py-1 rounded-full bg-black/6 text-black/50 tracking-widest uppercase">FAQ</span>
        </div>
        <h1 className="font-serif font-normal text-3xl text-center text-[#0f0f0f] mb-8">Common questions</h1>
        <div className="flex flex-col gap-2 mb-8">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium text-[#0f0f0f]">{item.q}</span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${open === i ? "bg-[#0f0f0f]" : "bg-black/6"}`}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    {open === i
                      ? <line x1="2" y1="5" x2="8" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      : <><line x1="5" y1="2" x2="5" y2="8" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="5" x2="8" y2="5" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></>
                    }
                  </svg>
                </span>
              </div>
              {open === i && <div className="px-4 pb-4 text-xs text-black/55 leading-relaxed">{item.a}</div>}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-black/45">
          Have another question?{" "}
          <a href="https://wa.me/27796463376" className="underline">Message us on WhatsApp</a>
        </p>
      </div>
    </main>
  );
}
