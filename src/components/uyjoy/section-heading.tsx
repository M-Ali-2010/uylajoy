import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  /** Slot for a "view all" link that sits on the baseline of the title. */
  action?: ReactNode;
  align?: "start" | "center";
  tone?: "default" | "light";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  tone = "default",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <span className={cn("eyebrow", tone === "light" && "text-white/60")}>{eyebrow}</span>
        )}
        <h2 className={cn("type-h2 mt-4", tone === "light" ? "text-white" : "text-foreground")}>
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "type-lead mt-3",
              tone === "light" ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
