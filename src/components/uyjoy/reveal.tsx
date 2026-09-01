"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal that can never hide content it fails to bring back.
 *
 * The element renders visible. Before the browser paints we hide only what is
 * still below the fold, so there is no flash, the server-rendered page reads
 * with JS disabled, and a stalled frame loop cannot leave the page blank.
 */

let observer: IntersectionObserver | null = null;
let observerDelivered = false;
let disabled = false;

/** Anything still staged when we give up on the observer. */
const staged = new Set<Element>();

function revealAll() {
  disabled = true;
  for (const node of staged) node.removeAttribute("data-reveal");
  staged.clear();
}

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        // IntersectionObserver always delivers an initial callback per target,
        // so one callback of any kind proves it is working.
        observerDelivered = true;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "in");
          staged.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    // Safety net: if the observer never reports back, show everything rather
    // than leaving a page of invisible sections behind.
    window.setTimeout(() => {
      if (!observerDelivered) revealAll();
    }, 2000);
  }
  return observer;
}

interface RevealProps {
  children: ReactNode;
  /** Stagger, in ms. Keep under ~250 so a grid never feels slow. */
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || disabled) return;

    // Nobody is watching a hidden tab — don't stage an animation for it.
    if (document.visibilityState === "hidden") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen: leave it exactly as the server rendered it.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    node.setAttribute("data-reveal", "pending");
    staged.add(node);

    const io = getObserver();
    io?.observe(node);

    return () => {
      staged.delete(node);
      io?.unobserve(node);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
