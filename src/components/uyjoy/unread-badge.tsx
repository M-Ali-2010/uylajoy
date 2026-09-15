import { cn } from "@/lib/utils";

/**
 * The unread count next to a bell or a nav row. Renders nothing at zero, so
 * callers can pass the raw count without guarding, and caps at 99+ so a long
 * number never widens the row it sits in.
 */
export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (!count || count < 1) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] leading-none font-bold text-primary-foreground tabular-nums",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
