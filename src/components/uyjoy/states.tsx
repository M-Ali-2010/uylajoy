import { Link } from "@tanstack/react-router";
import { AlertCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

/** Shared loading / empty / error presentations so every page behaves alike. */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("card-surface flex h-full flex-col overflow-hidden", className)}
    >
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4 md:p-5">
        <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border-strong px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message?: string | undefined;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <AlertCircle className="mb-3 size-6 text-destructive" />
      <p className="font-semibold">{t.common.loadError}</p>
      {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}

export function NotFoundState({
  title,
  description,
  backTo,
  backLabel,
}: {
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <div className="shell py-24 text-center">
      <h1 className="type-h2">{title}</h1>
      <p className="type-lead mx-auto mt-3 max-w-md text-muted-foreground">{description}</p>
      <Button className="mt-8" asChild>
        <Link to={backTo as "/"}>{backLabel}</Link>
      </Button>
    </div>
  );
}
