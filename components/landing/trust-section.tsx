"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Route, Zap, TrendingUp } from "lucide-react";

const cards = [
  {
    icon: Compass,
    title: "Understand your position",
    description: "Know where you stand legally, financially and educationally.",
  },
  {
    icon: Route,
    title: "Find your next move",
    description: "Get structured pathways based on your goals and circumstances.",
  },
  {
    icon: Zap,
    title: "Take action",
    description: "Generate plans, documents and next steps in minutes.",
  },
  {
    icon: TrendingUp,
    title: "Build your future",
    description: "Track progress over time through your Journey.",
  },
];

export function TrustSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Technology made for real people
          </span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6 text-balance">
            Most platforms give information.
            <br />
            <span className="text-muted-foreground">Kommune helps people move forward.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10 rounded-2xl overflow-hidden">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group bg-background p-8 lg:p-10 transition-all duration-700 hover:bg-secondary/40 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background mb-6 transition-transform duration-500 group-hover:-translate-y-1">
                  <Icon className="w-6 h-6" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <h3 className="text-xl font-display mt-2 mb-3">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
