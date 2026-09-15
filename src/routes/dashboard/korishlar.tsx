import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/uyjoy/dashboard/shell";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useUpdateViewingStatus, useViewingRequests, type ViewingRequest } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/korishlar")({
  head: () => ({
    meta: [{ title: "Ko'rishlar — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="viewings">
      <Viewings />
    </DashboardShell>
  ),
});

function Viewings() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<"owner" | "sent">("owner");
  const { data, isLoading, isError, error, refetch } = useViewingRequests(scope);
  const update = useUpdateViewingStatus();

  const label: Record<ViewingRequest["status"], string> = {
    new: t.dashboard.viewingNew,
    confirmed: t.dashboard.viewingConfirmed,
    declined: t.dashboard.viewingDeclined,
    done: t.dashboard.viewingDone,
  };
  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : t.common.error);

  return (
    <div className="space-y-5">
      <div className="segmented bg-secondary">
        {(["owner", "sent"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={scope === s}
            onClick={() => setScope(s)}
            className={cn(
              "segmented-item",
              scope === s ? "bg-card shadow-xs" : "text-muted-foreground",
            )}
          >
            {s === "owner" ? t.dashboard.viewings : t.dashboard.myViewings}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : !isLoading && (data?.length ?? 0) === 0 ? (
        <EmptyState icon={CalendarClock} title={t.dashboard.noViewings} />
      ) : (
        <ul className="space-y-3" aria-busy={isLoading}>
          {(data ?? []).map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      r.status === "new"
                        ? "bg-warning/20"
                        : r.status === "confirmed"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {label[r.status]}
                  </span>
                  <span className="text-sm font-semibold">
                    {new Date(r.preferredAt).toLocaleString()}
                  </span>
                </div>
                <Link
                  to="/elonlar/$id"
                  params={{ id: r.property.id }}
                  className="mt-1 block text-sm font-medium hover:text-primary"
                >
                  {r.property.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {r.name} ·{" "}
                  <a href={`tel:${r.phone}`} className="tnum text-primary">
                    {r.phone}
                  </a>
                </p>
                {r.message && <p className="mt-1 text-sm">{r.message}</p>}
              </div>
              {scope === "owner" && r.status === "new" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ id: r.id, status: "confirmed" }, { onError })}
                  >
                    {t.dashboard.viewingConfirmed}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ id: r.id, status: "declined" }, { onError })}
                  >
                    {t.dashboard.viewingDeclined}
                  </Button>
                </div>
              )}
              {scope === "owner" && r.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ id: r.id, status: "done" }, { onError })}
                >
                  {t.dashboard.viewingDone}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
