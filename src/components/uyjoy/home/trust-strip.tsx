"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";

/**
 * Counts up once, when the strip first comes into view. If motion is not
 * wanted — reduced-motion, or a tab nobody is looking at — the final value is
 * simply rendered. The markup is identical either way.
 */
function useCountUp(target: number, ref: React.RefObject<HTMLElement | null>) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.visibilityState === "hidden") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();

        const start = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // ease-out-quint, so it lands softly instead of stopping dead
          const eased = 1 - Math.pow(1 - progress, 5);
          setValue(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        setValue(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, ref]);

  return value;
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useCountUp(value, ref);

  return (
    <div ref={ref} className="px-5 py-7 text-center md:px-8 md:py-9 md:text-left">
      <p className="type-price tnum text-3xl text-foreground md:text-[2.5rem]">
        {shown.toLocaleString("en-US")}
        <span className="text-primary">{suffix}</span>
      </p>
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted-foreground">{label}</p>
    </div>
  );
}

export function TrustStrip() {
  const { t } = useTranslation();

  const stats = [
    { value: 2500, suffix: "+", label: t.home.statVerified },
    { value: 150, suffix: "+", label: t.home.statAgents },
    { value: 50, suffix: "+", label: t.home.statAgencies },
    { value: 98, suffix: "%", label: t.home.statSatisfaction },
  ];

  return (
    <section aria-label={t.home.statVerified} className="shell relative z-10 -mt-12 md:-mt-16">
      {/* gap-px over a border-coloured ground draws the hairlines for both the
          2x2 mobile grid and the 4-up desktop row without any per-cell rules */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-lg md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card">
            <Stat {...stat} />
          </div>
        ))}
      </div>
    </section>
  );
}
