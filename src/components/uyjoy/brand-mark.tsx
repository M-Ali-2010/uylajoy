import { cn } from "@/lib/utils";

/**
 * The UyJoy mark: a pointed arch, the doorway motif that runs through
 * Uzbek architecture. Reads as a house at 20px and as a brand at 200px.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-full", className)}>
      <path
        d="M12 4.2c3.9 0 6.6 3.1 6.6 7v8.6h-4.8v-8a1.8 1.8 0 0 0-3.6 0v8H5.4v-8.6c0-3.9 2.7-7 6.6-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandLockup({
  tone = "default",
  className,
}: {
  tone?: "default" | "light";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-[10px] transition-transform duration-300 group-hover:-translate-y-px",
          tone === "light" ? "bg-white text-ink" : "bg-primary text-primary-foreground",
        )}
      >
        <BrandMark className="size-5" />
      </span>
      <span
        className={cn(
          "font-display text-[1.35rem] font-extrabold leading-none tracking-[-0.04em]",
          tone === "light" ? "text-white" : "text-foreground",
        )}
      >
        UyJoy
        <span
          className={cn(
            "font-semibold",
            tone === "light" ? "text-white/55" : "text-muted-foreground",
          )}
        >
          .uz
        </span>
      </span>
    </span>
  );
}
