import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Home, LandPlot, MapPin, Search, ShieldCheck, TrendingUp, Warehouse, Star, Users } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities, listings, type PropType } from "@/data/listings";
import { useTranslation } from "@/i18n";
import hero from "@/assets/hero-tashkent.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UyJoy.uz — O'zbekistonda uy sotib olish va ijara" },
      {
        name: "description",
        content:
          "Toshkent, Samarqand va butun O'zbekiston bo'ylab tekshirilgan kvartira, hovli va ofis e'lonlari. Ipoteka kalkulyatori va real bozor narxlari.",
      },
      { property: "og:title", content: "UyJoy.uz — O'zbekiston ko'chmas mulk platformasi" },
      {
        property: "og:description",
        content: "Tekshirilgan e'lonlar, ipoteka kalkulyatori va hududlar bo'yicha bozor narxlari.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [deal, setDeal] = useState<"sotuv" | "ijara">("sotuv");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const featured = listings.filter((l) => l.featured).slice(0, 6);
  const recent = listings.slice(0, 3);

  const categories: { type: PropType; label: string; icon: typeof Home }[] = [
    { type: "kvartira", label: t.propertyType.apartments, icon: Building2 },
    { type: "hovli", label: t.propertyType.houses, icon: Home },
    { type: "ofis", label: t.propertyType.offices, icon: Warehouse },
    { type: "yer", label: t.propertyType.lands, icon: LandPlot },
  ];

  // Mock stats for homepage
  const stats = [
    { value: "2,500+", label: "E'lonlar" },
    { value: "150+", label: "Agentlar" },
    { value: "50+", label: "Agentliklar" },
    { value: "10,000+", label: "Foydalanuvchilar" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative">
          <img
            src={hero}
            alt="Toshkent shahri panoramasi va zamonaviy turar-joy binolari"
            width={1920}
            height={1080}
            className="h-[560px] w-full object-cover md:h-[640px]"
          />
          <div className="bg-hero-overlay absolute inset-0" />
          <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm md:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/90 md:text-base lg:text-lg">
              {t.home.heroSubtitle}
            </p>

            {/* Search Box */}
            <div className="mt-8 w-full max-w-4xl rounded-2xl bg-background/95 p-4 shadow-float backdrop-blur md:p-6">
              {/* Deal type tabs */}
              <div className="mb-4 flex gap-2">
                {(["sotuv", "ijara"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeal(d)}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                      deal === d
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {d === "sotuv" ? t.deal.buy : t.deal.rent}
                  </button>
                ))}
              </div>

              {/* Search form */}
              <form
                className="grid gap-3 md:grid-cols-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({
                    to: "/elonlar",
                    search: {
                      deal,
                      q: q || undefined,
                      city: selectedCity !== "all" ? selectedCity : undefined,
                      type: selectedType !== "all" ? selectedType : undefined,
                    },
                  });
                }}
              >
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.home.searchPlaceholder}
                    aria-label={t.common.search}
                    className="h-12 pl-9"
                  />
                </div>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t.filters.allCities} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.filters.allCities}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="submit" variant="hero" size="lg" className="h-12">
                  {t.common.search}
                </Button>
              </form>

              {/* Property type quick filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.type}
                    onClick={() => {
                      setSelectedType(c.type);
                      navigate({ to: "/elonlar", search: { type: c.type, deal } });
                    }}
                    className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <c.icon className="size-4" />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-extrabold text-primary md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Property Types */}
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-extrabold">{t.home.propertyTypes}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.type}
                to="/elonlar"
                search={{ type: c.type }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-float"
              >
                <span className="bg-brand flex size-12 items-center justify-center rounded-xl text-primary-foreground">
                  <c.icon className="size-6" />
                </span>
                <p className="mt-4 font-semibold">{c.label}</p>
                <p className="text-xs text-muted-foreground">
                  {listings.filter((l) => l.type === c.type).length} {t.home.listingsCount}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Listings */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">{t.home.featuredListings}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Moderatorlar tomonidan tanlangan eng yaxshi e'lonlar
              </p>
            </div>
            <Button variant="soft" asChild>
              <Link to="/elonlar">{t.home.viewAll}</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>
        </section>

        {/* Cities */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <h2 className="text-2xl font-extrabold">{t.home.byCity}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {cities.map((city) => (
              <Link
                key={city}
                to="/elonlar"
                search={{ city }}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-card transition-colors hover:bg-secondary"
              >
                <MapPin className="size-4 text-primary" />
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/40 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: t.home.verifiedListings,
                text: t.home.verifiedListingsDesc,
              },
              {
                icon: TrendingUp,
                title: t.home.realPrices,
                text: t.home.realPricesDesc,
              },
              {
                icon: Home,
                title: t.home.mortgageHelper,
                text: t.home.mortgageHelperDesc,
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-card p-6 shadow-card">
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="overflow-hidden rounded-3xl bg-brand p-8 text-center text-primary-foreground md:p-12">
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              Mulkingizni bepul e'lon qiling
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Minglab xaridorlar sizni kutmoqda. E'loningizni 3 daqiqada joylang va tekshirilgan
              xaridorlar bilan bog'laning.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="secondary" asChild>
                <Link to="/elon-joylash">{t.nav.postListing}</Link>
              </Button>
              <Button size="xl" variant="ghost" className="text-primary-foreground hover:bg-white/10" asChild>
                <Link to="/narxlar">{t.nav.marketPrices}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold">Yangi qo'shilgan e'lonlar</h2>
            <Button variant="soft" asChild>
              <Link to="/elonlar">{t.home.viewAll}</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
