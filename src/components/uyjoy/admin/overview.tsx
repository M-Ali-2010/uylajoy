"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, ClipboardList, Home, Inbox, Users } from "lucide-react";
import { ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { relativeTime } from "@/i18n/format";
import { useAdminStats } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function AdminOverview({ onOpenQueue }: { onOpenQueue: () => void }) {
  const { t, language } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminStats();

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  const n = (v: number | undefined) => (isLoading ? "…" : (v ?? 0).toLocaleString("en-US"));
  const listings = data?.listings ?? {};
  const pending = listings["pending"] ?? 0;

  const tiles = [
    { icon: Inbox, label: t.admin.listingsPending, value: n(pending), accent: pending > 0 },
    { icon: Home, label: t.admin.listingsActive, value: n(listings["active"]) },
    {
      icon: Users,
      label: t.admin.usersTotal,
      value: n(data?.users.total),
      sub: `+${n(data?.users.week)} ${t.admin.usersWeek}`,
    },
    {
      icon: ClipboardList,
      label: t.admin.leadsTotal,
      value: n(data?.leads.total),
      sub: `${n(data?.leads.open)} ${t.admin.leadsOpen}`,
    },
    { icon: CalendarClock, label: t.admin.viewingsOpen, value: n(data?.viewings.open) },
  ];

  const events: { key: string; label: string }[] = [
    { key: "property_view", label: t.admin.eventViews },
    { key: "contact_click", label: t.admin.eventContacts },
    { key: "lead_created", label: t.admin.eventLeads },
    { key: "viewing_requested", label: t.admin.eventViewings },
    { key: "favorite_added", label: t.admin.eventFavorites },
    { key: "listing_created", label: t.admin.eventCreated },
  ];
  const maxEvent = Math.max(1, ...events.map((e) => data?.eventsWeek[e.key] ?? 0));

  const verb: Record<string, string> = {
    "property.approve": t.admin.actionApprove,
    "property.reject": t.admin.actionReject,
    "property.archive": t.admin.actionArchive,
    "user.block": t.admin.actionBlock,
    "user.unblock": t.admin.actionUnblock,
  };

  return (
    <div className="space-y-6" aria-busy={isLoading}>
      {pending > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <span className="tnum font-semibold">{pending}</span> · {t.admin.listingsPending}
          </p>
          <Button size="sm" onClick={onOpenQueue}>
            {t.admin.goToQueue} <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              "rounded-xl border bg-card p-4",
              tile.accent ? "border-warning/50" : "border-border",
            )}
          >
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <tile.icon className="size-3.5" /> {tile.label}
            </p>
            <p className="type-price mt-2 text-2xl">{tile.value}</p>
            {tile.sub && <p className="mt-1 text-xs text-muted-foreground">{tile.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-border bg-card lg:col-span-5">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-display font-bold">{t.admin.activity7d}</h2>
          </header>
          <ul className="space-y-3 p-5">
            {events.map((e) => {
              const value = data?.eventsWeek[e.key] ?? 0;
              return (
                <li key={e.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span>{e.label}</span>
                    <span className="tnum font-semibold">{n(value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${(value / maxEvent) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card lg:col-span-7">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-display font-bold">{t.admin.log}</h2>
          </header>
          <ul className="divide-y divide-border">
            {(data?.recentActions ?? []).map((a) => (
              <li key={a.id} className="px-5 py-3 text-sm">
                <p>
                  <span className="font-semibold">{a.adminName ?? "—"}</span>{" "}
                  {verb[a.action] ?? a.action}{" "}
                  {a.targetType === "property" ? t.admin.targetListing : t.admin.targetUser}{" "}
                  {a.targetType === "property" ? (
                    <Link
                      to="/elonlar/$id"
                      params={{ id: a.targetId }}
                      className="text-primary hover:underline"
                    >
                      {a.targetId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="tnum text-muted-foreground">{a.targetId.slice(0, 8)}</span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {relativeTime(a.createdAt, language)}
                  </span>
                </p>
                {a.reason && <p className="mt-0.5 text-xs text-muted-foreground">{a.reason}</p>}
              </li>
            ))}
            {!isLoading && (data?.recentActions.length ?? 0) === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                {t.admin.logEmpty}
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display font-bold">{t.admin.recentUsers}</h2>
        </header>
        <ul className="divide-y divide-border">
          {(data?.recentUsers ?? []).map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm"
            >
              <span className="font-medium">{u.name}</span>
              <span className="text-muted-foreground">{u.email}</span>
              <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs">{u.role}</span>
              <span className="text-xs text-muted-foreground">
                {relativeTime(u.createdAt, language)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
