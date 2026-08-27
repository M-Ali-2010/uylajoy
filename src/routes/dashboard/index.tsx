import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Home,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Plus,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Boshqaruv paneli — UyJoy.uz" },
      { name: "description", content: "Agent boshqaruv paneli" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: t.dashboard.overview, icon: LayoutDashboard, exact: true },
    { to: "/dashboard/elonlarim", label: t.dashboard.myListings, icon: Home },
    { to: "/dashboard/tahlillar", label: t.dashboard.analytics, icon: BarChart3 },
    { to: "/dashboard/sorovlar", label: t.dashboard.leads, icon: Users },
    { to: "/dashboard/xabarlar", label: t.dashboard.messages, icon: MessageSquare },
    { to: "/dashboard/sozlamalar", label: t.dashboard.settings, icon: Settings },
  ];

  // Mock user data
  const user = {
    name: "Dilnoza Karimova",
    email: "dilnoza@uyjoy.uz",
    avatar: null,
    role: "Agent",
  };

  // Mock stats
  const stats = [
    { label: t.dashboard.totalListings, value: 12, change: "+2" },
    { label: t.dashboard.activeListings, value: 8, change: "0" },
    { label: t.dashboard.totalViews, value: 1234, change: "+156" },
    { label: t.dashboard.totalLeads, value: 24, change: "+5" },
  ];

  // Mock recent leads
  const recentLeads = [
    { id: 1, name: "Sardor Yusupov", property: "Yunusobodda 3 xonali", time: "2 soat oldin", status: "new" },
    { id: 2, name: "Nilufar Abdullayeva", property: "Chilonzorda 2 xonali", time: "5 soat oldin", status: "contacted" },
    { id: 3, name: "Bobur Toshmatov", property: "Sergeli 1 xonali", time: "1 kun oldin", status: "qualified" },
  ];

  const isExactMatch = (path: string) => location.pathname === path;
  const isActive = (to: string, exact?: boolean) => {
    if (exact) return isExactMatch(to);
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <Home className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">UyJoy.uz</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.to, item.exact)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <h1 className="font-display text-xl font-bold">{t.dashboard.title}</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="hero" asChild>
              <Link to="/elon-joylash">
                <Plus className="mr-2 size-4" />
                {t.dashboard.createListing}
              </Link>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                  <span className={`text-xs ${stat.change.startsWith("+") ? "text-primary" : "text-muted-foreground"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Recent leads */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{t.dashboard.leads}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard/sorovlar">
                    {t.home.viewAll}
                    <ChevronRight className="ml-1 size-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.property}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          lead.status === "new"
                            ? "bg-primary/10 text-primary"
                            : lead.status === "contacted"
                              ? "bg-accent/10 text-accent"
                              : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {lead.status === "new" ? "Yangi" : lead.status === "contacted" ? "Bog'lanildi" : "Tasdiqlandi"}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Tez amallar</h2>
              <div className="mt-4 grid gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/elon-joylash">
                    <Plus className="mr-2 size-4" />
                    Yangi e'lon joylash
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/dashboard/elonlarim">
                    <Home className="mr-2 size-4" />
                    E'lonlarimni boshqarish
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/dashboard/xabarlar">
                    <MessageSquare className="mr-2 size-4" />
                    Xabarlarni ko'rish
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/dashboard/tahlillar">
                    <BarChart3 className="mr-2 size-4" />
                    Tahlillarni ko'rish
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
