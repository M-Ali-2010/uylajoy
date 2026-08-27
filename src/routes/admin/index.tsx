import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Home,
  Users,
  Building2,
  Shield,
  MessageSquare,
  Star,
  BarChart3,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Panel — UyJoy.uz" },
      { name: "description", content: "Administrator boshqaruv paneli" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: "/admin", label: t.admin.dashboard, icon: LayoutDashboard, exact: true },
    { to: "/admin/elonlar", label: t.admin.listings, icon: Home },
    { to: "/admin/moderatsiya", label: t.admin.moderation, icon: Shield, badge: 5 },
    { to: "/admin/foydalanuvchilar", label: t.admin.users, icon: Users },
    { to: "/admin/agentlar", label: t.admin.agents, icon: Building2 },
    { to: "/admin/agentliklar", label: t.admin.agencies, icon: Building2 },
    { to: "/admin/sharhlar", label: t.admin.reviews, icon: Star },
    { to: "/admin/tahlillar", label: t.admin.analytics, icon: BarChart3 },
    { to: "/admin/kontent", label: t.admin.content, icon: FileText },
    { to: "/admin/sozlamalar", label: t.admin.settings, icon: Settings },
  ];

  // Mock stats
  const stats = [
    { label: "Jami foydalanuvchilar", value: 2456, icon: Users, change: "+123" },
    { label: "Jami e'lonlar", value: 892, icon: Home, change: "+45" },
    { label: "Faol e'lonlar", value: 654, icon: CheckCircle },
    { label: "Moderatsiyada", value: 12, icon: Clock, highlight: true },
  ];

  // Mock pending listings for moderation
  const pendingListings = [
    {
      id: "1",
      title: "Yunusobodda 3 xonali kvartira",
      price: 85000,
      agent: "Sardor Yusupov",
      date: "2 soat oldin",
      image: "/assets/prop-1.jpg",
    },
    {
      id: "2",
      title: "Chilonzorda 2 xonali yangi",
      price: 65000,
      agent: "Nilufar Abdullayeva",
      date: "4 soat oldin",
      image: "/assets/prop-2.jpg",
    },
    {
      id: "3",
      title: "Sergeli tumanida arzon kvartira",
      price: 42000,
      agent: "Bobur Toshmatov",
      date: "6 soat oldin",
      image: "/assets/prop-3.jpg",
    },
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
              <Shield className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.to, item.exact)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="size-5" />
                {item.label}
              </div>
              {item.badge && (
                <Badge variant="destructive" className="size-5 justify-center p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">Administrator</p>
              <p className="truncate text-xs text-muted-foreground">admin@uyjoy.uz</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <h1 className="font-display text-xl font-bold">{t.admin.title}</h1>
          <Button variant="outline" asChild>
            <Link to="/">Saytga o'tish</Link>
          </Button>
        </header>

        <div className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border bg-card p-5 shadow-card ${
                  stat.highlight ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <stat.icon className={`size-5 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <span className="text-xs text-primary">{stat.change}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pending moderation */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Moderatsiya kutayotgan e'lonlar</h2>
              <Button variant="soft" asChild>
                <a href="/admin/moderatsiya">{t.home.viewAll}</a>
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="size-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Home className="size-8" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${listing.price.toLocaleString()} • {listing.agent}
                    </p>
                    <p className="text-xs text-muted-foreground">{listing.date}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="default" size="icon" className="bg-primary">
                      <CheckCircle className="size-4" />
                    </Button>
                    <Button variant="destructive" size="icon">
                      <XCircle className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Recent users */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Yangi foydalanuvchilar</h2>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Sardor Yusupov", email: "sardor@mail.uz", date: "Bugun" },
                  { name: "Nilufar Abdullayeva", email: "nilufar@mail.uz", date: "Kecha" },
                  { name: "Bobur Toshmatov", email: "bobur@mail.uz", date: "2 kun oldin" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent reviews */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Yangi sharhlar</h2>
              <div className="mt-4 space-y-3">
                {[
                  { author: "Ali Karimov", rating: 5, text: "Ajoyib xizmat!", date: "1 soat oldin" },
                  { author: "Malika Sharipova", rating: 4, text: "Yaxshi tajriba", date: "3 soat oldin" },
                  { author: "Jasur Toshmatov", rating: 5, text: "Tavsiya qilaman!", date: "5 soat oldin" },
                ].map((review, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.author}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`size-3 ${j < review.rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{review.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
