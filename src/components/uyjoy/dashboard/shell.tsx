"use client";

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Home, LayoutDashboard, LogOut, Plus, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/uyjoy/brand-mark";
import { RequireAuth } from "@/components/uyjoy/require-auth";
import { useTranslation, type TranslationKeys } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

type DashboardTitle = keyof TranslationKeys["dashboard"];

/** Sidebar + header frame shared by every /dashboard page. */
export function DashboardShell({
  title,
  children,
}: {
  title: DashboardTitle;
  children: ReactNode;
}) {
  return (
    <RequireAuth>
      <Frame titleKey={title}>{children}</Frame>
    </RequireAuth>
  );
}

function Frame({ titleKey, children }: { titleKey: DashboardTitle; children: ReactNode }) {
  const { t } = useTranslation();
  const title = t.dashboard[titleKey];
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuthStore();

  const nav = [
    { to: "/dashboard", label: t.dashboard.overview, icon: LayoutDashboard, exact: true },
    { to: "/dashboard/elonlarim", label: t.dashboard.myListings, icon: Home, exact: false },
    { to: "/dashboard/sorovlar", label: t.dashboard.leads, icon: Users, exact: false },
    { to: "/dashboard/korishlar", label: t.dashboard.viewings, icon: CalendarClock, exact: false },
    { to: "/dashboard/sozlamalar", label: t.dashboard.settings, icon: Settings, exact: false },
  ] as const;

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link to="/" className="group" aria-label="UyJoy.uz">
            <BrandLockup />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label={t.dashboard.title}>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to, item.exact)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-[1.15rem]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <Button className="w-full gap-1.5" asChild>
            <Link to="/elon-joylash">
              <Plus className="size-4" /> {t.dashboard.createListing}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback>{user?.name.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.nav.logout}
              onClick={async () => {
                await logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
          <Link to="/" className="lg:hidden" aria-label="UyJoy.uz">
            <BrandLockup />
          </Link>
          <h1 className="hidden font-display text-lg font-bold tracking-tight lg:block">{title}</h1>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Button size="sm" asChild>
              <Link to="/elon-joylash" aria-label={t.dashboard.createListing}>
                <Plus className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 lg:hidden"
          aria-label={t.dashboard.title}
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium",
                isActive(item.to, item.exact) ? "bg-secondary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <h1 className="type-h2 mb-6 lg:hidden">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: t.dashboard.statusDraft, className: "bg-muted text-muted-foreground" },
    pending: {
      label: t.dashboard.statusPending,
      className: "bg-warning/20 text-warning-foreground",
    },
    active: { label: t.dashboard.statusActive, className: "bg-success/15 text-success" },
    paused: { label: t.dashboard.statusPaused, className: "bg-muted text-muted-foreground" },
    rejected: {
      label: t.dashboard.statusRejected,
      className: "bg-destructive/10 text-destructive",
    },
    archived: { label: t.dashboard.statusArchived, className: "bg-muted text-muted-foreground" },
    sold: { label: t.dashboard.statusSold, className: "bg-primary-soft text-primary" },
    rented: { label: t.dashboard.statusRented, className: "bg-primary-soft text-primary" },
  };
  const s = map[status] ?? { label: status, className: "bg-muted" };
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", s.className)}>
      {s.label}
    </span>
  );
}
