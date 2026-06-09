"use client";

import { useEffect, useState, useRef } from "react";

const locations = [
  { city: "R300. Once.", region: "No subscription. No trial. No upsell.", latency: "Flat" },
  { city: "We don't inform. We execute.", region: "Every interaction produces a decision.", latency: "Action" },
  { city: "Built for the forgotten.", region: "Migrants, refugees, asylum seekers.", latency: "Day 1" },
  { city: "No SA ID required", region: "Foreign nationals from day one.", latency: "Open" },
  { city: "Every agent included", region: "All five, from the start.", latency: "All" },
  { city: "One transferable pass", region: "Give another migrant access.", latency: "+1" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLocation, setActiveLocation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLocation((prev) => (prev + 1) % locations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Why Kommune
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Administrative agency,
              <br />
              for everyone.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              One flat activation. No SA ID required. Works for asylum seekers and 
              foreign nationals from day one.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">R300</div>
                <div className="text-sm text-muted-foreground">Once-off</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">5</div>
                <div className="text-sm text-muted-foreground">Specialist agents</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">+1</div>
                <div className="text-sm text-muted-foreground">Support Pass</div>
              </div>
            </div>
          </div>

          {/* Right: Location list */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">What you get</span>
                <span className="flex items-center gap-2 text-xs font-mono text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All included
                </span>
              </div>

              {/* Locations */}
              <div>
                {locations.map((location, index) => (
                  <div
                    key={location.city}
                    className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 flex items-center justify-between transition-all duration-300 ${
                      activeLocation === index ? "bg-foreground/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          activeLocation === index ? "bg-foreground" : "bg-foreground/20"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-muted-foreground">{location.region}</div>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">{location.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
