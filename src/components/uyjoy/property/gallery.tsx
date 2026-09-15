"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Cover + thumbnails. Keyboard-navigable, no library. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const list = images.length > 0 ? images : ["/images/placeholder-property.svg"];
  const current = list[Math.min(index, list.length - 1)]!;

  const go = (delta: number) => setIndex((i) => (i + delta + list.length) % list.length);

  return (
    <figure className="m-0">
      <div className="media-frame group relative overflow-hidden rounded-xl bg-muted shadow-card">
        <img
          src={current}
          alt={`${title} — ${index + 1}/${list.length}`}
          width={1280}
          height={860}
          fetchPriority="high"
          className="h-[300px] w-full object-cover md:h-[460px]"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="media-action absolute top-1/2 left-3 size-10 -translate-y-1/2"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="media-action absolute top-1/2 right-3 size-10 -translate-y-1/2"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="tnum absolute right-3 bottom-3 rounded-md bg-ink/70 px-2 py-1 text-xs font-semibold text-white">
              {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <img src={src} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
