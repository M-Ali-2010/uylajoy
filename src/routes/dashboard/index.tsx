import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Eye, Home, Users } from "lucide-react";
import { DashboardShell, StatusBadge } from "@/components/uyjoy/dashboard/shell";
import { EmptyState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { useLeads, useMyListings, useViewingRequests } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Boshqaruv paneli — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="overview">
      <Overview />
    </DashboardShell>
  ),
});

function Overview() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const listings = useMyListings();
  const leads = useLeads();
  const viewings = useViewingRequests("owner");

  const all = listings.data ?? [];
  const stats = [
    { label: t.dashboard.totalListings, value: all.length, icon: Home },
    {
      label: t.dashboard.activeListings,
      value: all.filter((l) => l.status === "active").length,
      icon: Home,
    },
    {
      label: t.dashboard.pendingListings,
      value: all.filter((l) => l.status === "pending").length,
      icon: Home,
    },
    { label: t.dashboard.totalViews, value: all.reduce((n, l) => n + l.viewCount, 0), icon: Eye },
    { label: t.dashboard.totalLeads, value: leads.data?.length ?? 0, icon: Users },
    {
      label: t.dashboard.viewings,
      value: viewings.data?.filter((v) => v.status === "new").length ?? 0,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground">
        {t.dashboard.welcome}, <span className="font-semibold text-foreground">{user?.name}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <s.icon className="size-3.5" /> {s.label}
            </p>
            <p className="type-price mt-2 text-2xl">
              {listings.isLoading ? "…" : s.value.toLocaleString("en-US")}
            </p>
          </div>
        ))}
      </div>

      {!listings.isLoading && all.length === 0 && (
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
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display font-bold">{t.dashboard.myListings}</h2>
            <Link
              to="/dashboard/elonlarim"
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              {t.home.viewAll} <ArrowRight className="size-3.5" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {all.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                <img src={l.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/elonlar/$id"
                    params={{ id: l.id }}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {l.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {l.district}, {l.city} · <span className="tnum">{l.viewCount}</span>{" "}
                    {t.property.views}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </li>
            ))}
            {all.length === 0 && !listings.isLoading && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">—</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display font-bold">{t.dashboard.leads}</h2>
            <Link
              to="/dashboard/sorovlar"
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              {t.home.viewAll} <ArrowRight className="size-3.5" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(leads.data ?? []).slice(0, 5).map((lead) => (
              <li key={lead.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{lead.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {lead.property?.title ?? ""} · <span className="tnum">{lead.phone}</span>
                </p>
              </li>
            ))}
            {(leads.data?.length ?? 0) === 0 && !leads.isLoading && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                {t.dashboard.noLeads}
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
