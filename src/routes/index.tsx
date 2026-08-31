"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from "framer-motion";
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
  ArrowRight,
  Sparkles,
  ChevronDown,
  Play,
  Check,
  Zap,
  Users,
  Award,
  Clock,
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

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
    return unsubscribe;
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// Floating Card Component for Hero
function FloatingCard({ delay, className, children }: { delay: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
      className={cn("glass rounded-2xl shadow-xl", className)}
    >
      {children}
    </motion.div>
  );
}

function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [deal, setDeal] = useState<"sotuv" | "ijara">("sotuv");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const featured = listings.filter((l) => l.featured).slice(0, 6);
  const recent = listings.slice(0, 6);

  const categories: { type: PropType; label: string; icon: typeof Home; count: number; color: string; bg: string }[] = [
    {
      type: "kvartira",
      label: t.propertyType.apartments,
      icon: Building2,
      count: listings.filter((l) => l.type === "kvartira").length,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      type: "hovli",
      label: t.propertyType.houses,
      icon: Home,
      count: listings.filter((l) => l.type === "hovli").length,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      type: "ofis",
      label: t.propertyType.offices,
      icon: Warehouse,
      count: listings.filter((l) => l.type === "ofis").length,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      type: "yer",
      label: t.propertyType.lands,
      icon: LandPlot,
      count: listings.filter((l) => l.type === "yer").length,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const stats = [
    { value: 2500, label: t.home.listingsCount, suffix: "+", icon: Building2 },
    { value: 150, label: "Agentlar", suffix: "+", icon: Users },
    { value: 50, label: "Agentliklar", suffix: "+", icon: Award },
    { value: 98, label: "Mamnunlik", suffix: "%", icon: Star },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: t.home.verifiedListings,
      description: t.home.verifiedListingsDesc,
    },
    {
      icon: TrendingUp,
      title: t.home.realPrices,
      description: t.home.realPricesDesc,
    },
    {
      icon: Clock,
      title: "Tezkor javob",
      description: "E'lonlarga 24 soat ichida javob oling",
    },
    {
      icon: Zap,
      title: t.home.mortgageHelper,
      description: t.home.mortgageHelperDesc,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main>
        {/* ========== HERO SECTION ========== */}
        <section ref={heroRef} className="relative min-h-[100vh] overflow-hidden">
          {/* Background Image with Parallax */}
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
            <img
              src={hero}
              alt="Toshkent"
              className="size-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
          </motion.div>

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-30" />

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/20 blur-[100px]"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-accent/20 blur-[100px]"
            />
          </div>

          {/* Hero Content */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 flex min-h-[100vh] items-center"
          >
            <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 lg:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left Content */}
                <div className="flex flex-col justify-center">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
                  >
                    <span className="flex size-2 animate-pulse rounded-full bg-green-400" />
                    <span className="text-sm font-medium text-white">
                      {listings.length}+ ta aktiv e'lon
                    </span>
                  </motion.div>

                  {/* Main Heading */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="font-display text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                  >
                    O'zingizga mos
                    <span className="relative">
                      <span className="relative z-10 text-gradient-primary"> uyingizni </span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute -bottom-2 left-0 h-3 w-full origin-left bg-accent/30"
                      />
                    </span>
                    toping
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 max-w-lg text-lg text-white/80 md:text-xl"
                  >
                    {t.home.heroSubtitle}
                  </motion.p>

                  {/* Feature Pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex flex-wrap gap-3"
                  >
                    {[
                      { icon: Check, text: "Tekshirilgan e'lonlar" },
                      { icon: Check, text: "Real narxlar" },
                      { icon: Check, text: "Tezkor bog'lanish" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                      >
                        <item.icon className="size-4 text-green-400" />
                        {item.text}
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-10 flex flex-wrap gap-4"
                  >
                    <Button
                      size="xl"
                      className="group gap-2 rounded-full bg-white px-8 text-primary shadow-2xl shadow-white/20 hover:bg-white/90"
                      asChild
                    >
                      <Link to="/elonlar">
                        {t.common.search}
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      size="xl"
                      variant="ghost"
                      className="gap-2 rounded-full border border-white/30 px-8 text-white hover:bg-white/10"
                      asChild
                    >
                      <Link to="/elon-joylash">
                        <Play className="size-5" />
                        E'lon berish
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Right - Search Card */}
                <motion.div
                  initial={{ opacity: 0, x: 40, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex items-center justify-center lg:justify-end"
                >
                  <div
                    className={cn(
                      "relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl transition-all duration-300 md:p-8",
                      isSearchFocused && "border-white/40 shadow-2xl shadow-primary/20"
                    )}
                  >
                    {/* Glow Effect */}
                    <div className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-primary/50 via-transparent to-accent/50 opacity-50 blur-xl" />

                    {/* Search Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-white">
                        Qidiruv
                      </h3>
                      <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
                        {(["sotuv", "ijara"] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => setDeal(d)}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                              deal === d
                                ? "bg-white text-primary shadow-lg"
                                : "text-white/70 hover:text-white"
                            )}
                          >
                            {d === "sotuv" ? t.deal.buy : t.deal.rent}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Form */}
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        navigate({
                          to: "/elonlar",
                          search: {
                            deal,
                            q: q || undefined,
                            city: selectedCity !== "all" ? selectedCity : undefined,
                          },
                        });
                      }}
                    >
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/50" />
                        <Input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          placeholder={t.home.searchPlaceholder}
                          className="h-14 rounded-xl border-white/20 bg-white/10 pl-12 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
                        />
                      </div>

                      {/* City Select */}
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-14 rounded-xl border-white/20 bg-white/10 text-white">
                          <MapPin className="mr-2 size-5 text-white/50" />
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

                      {/* Property Types */}
                      <div className="grid grid-cols-4 gap-2">
                        {categories.map((c) => (
                          <button
                            key={c.type}
                            type="button"
                            onClick={() => {
                              navigate({ to: "/elonlar", search: { type: c.type, deal } });
                            }}
                            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 p-3 text-white/70 transition-all hover:bg-white/20 hover:text-white"
                          >
                            <c.icon className="size-5" />
                            <span className="text-[10px] font-medium">{c.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="xl"
                        className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold shadow-lg shadow-primary/25"
                      >
                        <Search className="size-5" />
                        {t.common.search}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-white/60">Pastga suring</span>
              <ChevronDown className="size-5 text-white/60" />
            </motion.div>
          </motion.div>
        </section>

        {/* ========== STATS SECTION ========== */}
        <section className="relative z-20 -mt-24 px-4">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-6 shadow-2xl md:grid-cols-4 md:p-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  {i !== stats.length - 1 && (
                    <div className="absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-border md:block" />
                  )}
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="size-6 text-primary" />
                  </div>
                  <p className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ========== PROPERTY TYPES ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <Sparkles className="size-4" />
                Kategoriyalar
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">
                {t.home.propertyTypes}
              </h2>
              <p className="mt-3 text-muted-foreground">
                Har xil turdagi ko'chmas mulklarni toping
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {categories.map((c, i) => (
                <motion.div
                  key={c.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to="/elonlar"
                    search={{ type: c.type }}
                    className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-float md:p-8"
                  >
                    {/* Hover glow */}
                    <div className={cn("absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100", c.bg)} />

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn("relative flex size-16 items-center justify-center rounded-2xl md:size-20", c.bg)}
                    >
                      <c.icon className={cn("size-8 md:size-10", c.color)} />
                    </motion.div>

                    <h3 className="relative mt-4 text-lg font-bold md:text-xl">{c.label}</h3>
                    <p className="relative mt-1 text-sm text-muted-foreground">
                      {c.count} ta e'lon
                    </p>

                    <div className="relative mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ko'rish
                      <ArrowRight className="size-4" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FEATURED LISTINGS ========== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-transparent py-20">
          {/* Background pattern */}
          <div className="absolute inset-0 dot-pattern" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gold/20">
                    <Star className="size-4 fill-gold text-gold" />
                  </div>
                  <span className="font-semibold text-gold">Premium</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
                  {t.home.featuredListings}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Moderatorlar tomonidan tanlangan eng yaxshi e'lonlar
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="hidden gap-2 rounded-full md:flex"
                asChild
              >
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Featured listing */}
            {featured[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <FeaturedPropertyCard listing={featured[0]} />
              </motion.div>
            )}

            {/* Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(1, 4).map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                >
                  <PropertyCard listing={l} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" size="lg" className="gap-2 rounded-full" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ========== FEATURES ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                <Zap className="size-4" />
                Afzalliklar
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">
                Nima uchun UyJoy.uz?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Biz bilan ko'chmas mulk qidirish oson va ishonchli
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex size-14 items-center justify-center rounded-xl bg-primary/10"
                  >
                    <f.icon className="size-7 text-primary" />
                  </motion.div>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CITIES ========== */}
        <section className="section-padding bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                {t.home.byCity}
              </h2>
              <p className="mt-3 text-muted-foreground">
                O'zbekistonning eng yirik shaharlarida qidiring
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 flex flex-wrap justify-center gap-3"
            >
              {cities.map((city, i) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/elonlar"
                    search={{ city }}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <MapPin className="size-4 text-primary" />
                    {city}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-5xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-accent p-8 text-center text-white shadow-2xl md:p-16"
            >
              {/* Background decorations */}
              <div className="absolute inset-0 hero-pattern opacity-20" />
              <div className="absolute -right-24 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <Home className="size-10" />
                </motion.div>

                <h2 className="font-display text-3xl font-extrabold md:text-4xl lg:text-5xl">
                  Mulkingizni bepul e'lon qiling
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
                  Minglab xaridorlar sizni kutmoqda. E'loningizni 3 daqiqada joylang.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    size="xl"
                    className="gap-2 rounded-full bg-white px-8 text-primary shadow-xl hover:bg-white/90"
                    asChild
                  >
                    <Link to="/elon-joylash">
                      {t.nav.postListing}
                      <ArrowRight className="size-5" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="ghost"
                    className="gap-2 rounded-full border border-white/30 px-8 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link to="/narxlar">
                      <TrendingUp className="size-5" />
                      {t.nav.marketPrices}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== RECENT LISTINGS ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
            >
              <div>
                <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                  Yangi qo'shilgan e'lonlar
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Eng so'nggi e'lonlar bilan tanishing
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="hidden gap-2 rounded-full md:flex"
                asChild
              >
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recent.slice(0, 6).map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PropertyCard listing={l} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" size="lg" className="gap-2 rounded-full" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
