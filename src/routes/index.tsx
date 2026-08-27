"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Home,
  LandPlot,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
  Warehouse,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play,
} from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard, FeaturedPropertyCard } from "@/components/uyjoy/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Animated, Staggered, StaggeredItem, Counter, GradientText } from "@/components/ui/animated";
import { cities, listings, type PropType } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  const featured = listings.filter((l) => l.featured).slice(0, 6);
  const recent = listings.slice(0, 6);

  const categories: { type: PropType; label: string; icon: typeof Home; count: number; gradient: string }[] = [
    {
      type: "kvartira",
      label: t.propertyType.apartments,
      icon: Building2,
      count: listings.filter((l) => l.type === "kvartira").length,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      type: "hovli",
      label: t.propertyType.houses,
      icon: Home,
      count: listings.filter((l) => l.type === "hovli").length,
      gradient: "from-green-500 to-emerald-400",
    },
    {
      type: "ofis",
      label: t.propertyType.offices,
      icon: Warehouse,
      count: listings.filter((l) => l.type === "ofis").length,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      type: "yer",
      label: t.propertyType.lands,
      icon: LandPlot,
      count: listings.filter((l) => l.type === "yer").length,
      gradient: "from-orange-500 to-amber-400",
    },
  ];

  const stats = [
    { value: 2500, label: "E'lonlar", suffix: "+" },
    { value: 150, label: "Agentlar", suffix: "+" },
    { value: 50, label: "Agentliklar", suffix: "+" },
    { value: 10000, label: "Foydalanuvchilar", suffix: "+" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative h-[700px] overflow-hidden md:h-[800px]">
          {/* Animated background */}
          <motion.div
            style={{ scale: heroScale, y: heroY }}
            className="absolute inset-0"
          >
            <motion.img
              src={hero}
              alt="Toshkent shahri panoramasi va zamonaviy turar-joy binolari"
              className="size-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </motion.div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-2 rounded-full bg-white/20"
                initial={{
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
                  y: Math.random() * 800,
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 mx-auto flex max-w-6xl flex-col items-center justify-center px-4 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md"
            >
              <Sparkles className="size-4 text-gold" />
              <span className="text-sm font-medium text-white">
                O'zbekistonning #1 ko'chmas mulk platformasi
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl lg:text-7xl"
            >
              {t.home.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl"
            >
              {t.home.heroSubtitle}
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={cn(
                "mt-10 w-full max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 md:p-8",
                isSearchFocused && "ring-4 ring-primary/30"
              )}
            >
              {/* Deal type tabs */}
              <div className="mb-6 flex gap-2">
                {(["sotuv", "ijara"] as const).map((d) => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeal(d)}
                    className={cn(
                      "rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300",
                      deal === d
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {d === "sotuv" ? t.deal.buy : t.deal.rent}
                  </motion.button>
                ))}
              </div>

              {/* Search form */}
              <form
                className="grid gap-4 md:grid-cols-4"
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
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={t.home.searchPlaceholder}
                    className="h-14 rounded-xl border-2 pl-12 text-base transition-all focus:border-primary"
                  />
                </div>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-14 rounded-xl border-2 text-base">
                    <MapPin className="mr-2 size-5 text-muted-foreground" />
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

                <Button type="submit" variant="hero" size="xl" className="h-14 rounded-xl text-base">
                  <Search className="mr-2 size-5" />
                  {t.common.search}
                </Button>
              </form>

              {/* Property type quick filters */}
              <div className="mt-6 flex flex-wrap gap-3">
                {categories.map((c, i) => (
                  <motion.button
                    key={c.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedType(c.type);
                      navigate({ to: "/elonlar", search: { type: c.type, deal } });
                    }}
                    className="flex items-center gap-2 rounded-full border-2 border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <c.icon className="size-4 text-primary" />
                    {c.label}
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {c.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-white/60"
              >
                <span className="text-xs">Pastga suring</span>
                <ChevronRight className="size-5 rotate-90" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-20 z-10 mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-8 shadow-2xl md:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-extrabold text-primary md:text-4xl">
                  <Counter to={stat.value} suffix={stat.suffix} duration={2} />
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Property Types */}
        <section className="mx-auto max-w-7xl px-4 py-20">
          <Animated animation="fadeInUp">
            <div className="text-center">
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                {t.home.propertyTypes}
              </h2>
              <p className="mt-3 text-muted-foreground">
                Har xil turdagi ko'chmas mulklarni toping
              </p>
            </div>
          </Animated>

          <Staggered className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.map((c) => (
              <StaggeredItem key={c.type}>
                <motion.div whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/elonlar"
                    search={{ type: c.type }}
                    className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card transition-shadow hover:shadow-float"
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10",
                        c.gradient
                      )}
                    />

                    <motion.span
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      className={cn(
                        "flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                        c.gradient
                      )}
                    >
                      <c.icon className="size-8" />
                    </motion.span>

                    <p className="mt-5 text-xl font-bold">{c.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.count} {t.home.listingsCount}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ko'rish <ArrowRight className="size-4" />
                    </div>
                  </Link>
                </motion.div>
              </StaggeredItem>
            ))}
          </Staggered>
        </section>

        {/* Featured Listings */}
        <section className="bg-gradient-to-b from-secondary/30 to-transparent py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Animated animation="fadeInUp" className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="size-5 fill-gold text-gold" />
                  <span className="text-sm font-semibold text-primary">Premium</span>
                </div>
                <h2 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
                  {t.home.featuredListings}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Moderatorlar tomonidan tanlangan eng yaxshi e'lonlar
                </p>
              </div>
              <Button variant="outline" size="lg" className="hidden md:flex" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </Animated>

            {/* Featured slider */}
            <div className="mt-10">
              {featured[0] && (
                <Animated animation="fadeInUp" delay={0.2}>
                  <FeaturedPropertyCard listing={featured[0]} />
                </Animated>
              )}
            </div>

            <Staggered className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(1, 4).map((l) => (
                <StaggeredItem key={l.id}>
                  <PropertyCard listing={l} />
                </StaggeredItem>
              ))}
            </Staggered>

            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" size="lg" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="mx-auto max-w-7xl px-4 py-20">
          <Animated animation="fadeInUp" className="text-center">
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">
              {t.home.byCity}
            </h2>
            <p className="mt-3 text-muted-foreground">
              O'zbekistonning eng yirik shaharlarida qidiring
            </p>
          </Animated>

          <Staggered fast className="mt-10 flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <StaggeredItem key={city}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/elonlar"
                    search={{ city }}
                    className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-5 py-3 font-medium shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <MapPin className="size-4 text-primary" />
                    {city}
                  </Link>
                </motion.div>
              </StaggeredItem>
            ))}
          </Staggered>
        </section>

        {/* Features */}
        <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Animated animation="fadeInUp" className="text-center">
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                Nima uchun UyJoy.uz?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Biz bilan ko'chmas mulk qidirish oson va ishonchli
              </p>
            </Animated>

            <Staggered className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: t.home.verifiedListings,
                  text: t.home.verifiedListingsDesc,
                  color: "from-green-500 to-emerald-400",
                },
                {
                  icon: TrendingUp,
                  title: t.home.realPrices,
                  text: t.home.realPricesDesc,
                  color: "from-blue-500 to-cyan-400",
                },
                {
                  icon: Home,
                  title: t.home.mortgageHelper,
                  text: t.home.mortgageHelperDesc,
                  color: "from-purple-500 to-pink-400",
                },
              ].map((f) => (
                <StaggeredItem key={f.title}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="rounded-3xl border border-border bg-card p-8 shadow-card transition-shadow hover:shadow-float"
                  >
                    <motion.span
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      className={cn(
                        "flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                        f.color
                      )}
                    >
                      <f.icon className="size-8" />
                    </motion.span>
                    <h3 className="mt-6 text-xl font-bold">{f.title}</h3>
                    <p className="mt-3 text-muted-foreground">{f.text}</p>
                  </motion.div>
                </StaggeredItem>
              ))}
            </Staggered>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-20">
          <Animated animation="scaleIn">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] p-12 text-center text-white shadow-2xl md:p-16"
            >
              {/* Animated background */}
              <motion.div
                animate={{ backgroundPosition: ["0%", "100%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] opacity-50"
              />

              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <Home className="size-10" />
                </motion.div>

                <h2 className="font-display text-3xl font-extrabold md:text-4xl lg:text-5xl">
                  Mulkingizni bepul e'lon qiling
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
                  Minglab xaridorlar sizni kutmoqda. E'loningizni 3 daqiqada joylang va tekshirilgan
                  xaridorlar bilan bog'laning.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    size="xl"
                    className="bg-white text-primary shadow-xl hover:bg-white/90"
                    asChild
                  >
                    <Link to="/elon-joylash">
                      {t.nav.postListing}
                      <ArrowRight className="ml-2 size-5" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="ghost"
                    className="border-2 border-white/30 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link to="/narxlar">
                      <Play className="mr-2 size-5" />
                      {t.nav.marketPrices}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </Animated>
        </section>

        {/* Recent Listings */}
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <Animated animation="fadeInUp" className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                Yangi qo'shilgan e'lonlar
              </h2>
              <p className="mt-2 text-muted-foreground">
                Eng so'nggi e'lonlar bilan tanishing
              </p>
            </div>
            <Button variant="outline" size="lg" className="hidden md:flex" asChild>
              <Link to="/elonlar">
                {t.home.viewAll}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </Animated>

          <Staggered className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((l) => (
              <StaggeredItem key={l.id}>
                <PropertyCard listing={l} />
              </StaggeredItem>
            ))}
          </Staggered>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" size="lg" asChild>
              <Link to="/elonlar">
                {t.home.viewAll}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
