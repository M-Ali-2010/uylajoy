import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Home, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, StatusBadge } from "@/components/uyjoy/dashboard/shell";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { formatListingPrice, useCurrency } from "@/lib/currency";
import { useDeleteListing, useMyListings, useUpdateListing } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/elonlarim")({
  head: () => ({
    meta: [{ title: "Mening e'lonlarim — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="myListings">
      <MyListings />
    </DashboardShell>
  ),
});

function MyListings() {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const { data, isLoading, isError, error, refetch } = useMyListings();
  const update = useUpdateListing();
  const remove = useDeleteListing();

  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : t.common.error);

  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );

  if (!isLoading && (data?.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={Home}
        title={t.dashboard.noListings}
        description={t.dashboard.noListingsDesc}
        action={
          <Button asChild>
            <Link to="/elon-joylash">{t.dashboard.createListing}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-3" aria-busy={isLoading}>
      {(data ?? []).map((l) => {
        const busy = update.isPending || remove.isPending;
        return (
          <li
            key={l.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center"
          >
            <img
              src={l.image}
              alt=""
              className="h-24 w-full shrink-0 rounded-lg object-cover md:w-36"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={l.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(l.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Link
                to="/elonlar/$id"
                params={{ id: l.id }}
                className="mt-1.5 block font-semibold hover:text-primary"
              >
                {l.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {l.district}, {l.city} ·{" "}
                <span className="tnum font-medium text-foreground">
                  {formatListingPrice(l.price, l.deal, currency, format)}
                </span>{" "}
                · <span className="tnum">{l.viewCount}</span> {t.property.views}
              </p>
              {l.status === "rejected" && l.rejectionReason && (
                <p className="mt-2 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <span className="font-semibold">{t.dashboard.rejectionReason}:</span>{" "}
                  {l.rejectionReason}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {(l.status === "rejected" ||
                l.status === "paused" ||
                l.status === "archived" ||
                l.status === "draft") && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    update.mutate({ id: l.id, data: { status: "pending" } }, { onError })
                  }
                >
                  <RotateCcw className="size-3.5" />{" "}
                  {l.status === "archived" ? t.dashboard.unarchive : t.dashboard.resubmit}
                </Button>
              )}
              {(l.status === "active" || l.status === "pending" || l.status === "paused") && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    update.mutate({ id: l.id, data: { status: "archived" } }, { onError })
                  }
                >
                  <Archive className="size-3.5" /> {t.dashboard.archive}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(t.dashboard.deleteConfirm)) remove.mutate(l.id, { onError });
                }}
              >
                <Trash2 className="size-3.5" /> {t.dashboard.delete}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
