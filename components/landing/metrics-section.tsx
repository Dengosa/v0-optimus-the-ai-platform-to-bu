"use client";

import { useEffect, useRef, useState } from "react";
import { getWaitlistCount } from "@/lib/api";

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
}: {
  end: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));

            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={ref} className="text-6xl lg:text-8xl font-display tracking-tight">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

type Metric = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

const metrics: Metric[] = [
  {
    value: 300,
    suffix: "",
    prefix: "R",
    label: "Once-off activation",
  },
  {
    value: 5,
    suffix: "",
    prefix: "",
    label: "Specialist assistants working for you",
  },
  {
    // Placeholder until we fetch waitlist count
    value: 0,
    suffix: "/7",
    prefix: "",
    label: "Always working on your behalf",
  },
  {
    value: 1,
    suffix: "",
    prefix: "+",
    label: "Support Pass to transfer",
  },
];

export function MetricsSection() {
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setWaitlistLoading(true);
        setWaitlistError(null);
        const count = await getWaitlistCount();
        if (!cancelled) setWaitlistCount(count);
      } catch (e: any) {
        if (!cancelled) setWaitlistError(e?.message ?? "Failed to load waitlist count");
      } finally {
        if (!cancelled) setWaitlistLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const renderMetricEnd = (m: Metric) => {
    if (m.label === "Always working on your behalf") {
      return waitlistCount ?? 0;
    }
    return m.value;
  };

  return (
    <section
      id="studio"
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-y border-foreground/10"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Readiness score
            </span>
            <h2
              className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Progress you
              <br />
              can measure.
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
            <span className="text-foreground/30">|</span>
            <span suppressHydrationWarning>{time.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
          {metrics.map((metric, index) => {
            const end = renderMetricEnd(metric);
            return (
              <div
                key={metric.label}
                className={`bg-background p-8 lg:p-12 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {metric.label === "Always working on your behalf" && waitlistLoading ? (
                  <div className="text-6xl lg:text-8xl font-display tracking-tight">…</div>
                ) : metric.label === "Always working on your behalf" && waitlistError ? (
                  <div className="text-6xl lg:text-8xl font-display tracking-tight">0</div>
                ) : (
                  <AnimatedCounter
                    end={typeof end === "number" ? end : 0}
                    suffix={metric.suffix}
                    prefix={metric.prefix}
                  />
                )}
                <div className="mt-4 text-lg text-muted-foreground">{metric.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


