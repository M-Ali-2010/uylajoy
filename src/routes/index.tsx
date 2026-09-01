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
  Check,
  Zap,
  Users,
  Award,
  Clock,
  ChevronRight,
  Calculator,
  Verified,
  Timer,
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
import prop1 from "@/assets/prop-1.jpg";
import prop2 from "@/assets/prop-2.jpg";
import prop3 from "@/assets/prop-3.jpg";
import prop4 from "@/assets/prop-4.jpg";

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

  // Categories with images
  const categories: { type: PropType; label: string; icon: typeof Home; count: number; image: string; gradient: string }[] = [
    {
      type: "kvartira",
      label: t.propertyType.apartments,
      icon: Building2,
      count: listings.filter((l) => l.type === "kvartira").length,
      image: prop1,
      gradient: "from-primary/90 to-primary/70",
    },
    {
      type: "hovli",
      label: t.propertyType.houses,
      icon: Home,
      count: listings.filter((l) => l.type === "hovli").length,
      image: prop3,
      gradient: "from-emerald-600/90 to-emerald-700/70",
    },
    {
      type: "ofis",
      label: t.propertyType.offices,
      icon: Warehouse,
      count: listings.filter((l) => l.type === "ofis").length,
      image: prop4,
      gradient: "from-violet-600/90 to-violet-700/70",
    },
    {
      type: "yer",
      label: t.propertyType.lands,
      icon: LandPlot,
      count: listings.filter((l) => l.type === "yer").length,
      image: prop2,
      gradient: "from-amber-600/90 to-amber-700/70",
    },
  ];

  const stats = [
    { value: 2500, label: "Tekshirilgan e'lonlar", suffix: "+" },
    { value: 150, label: "Professional agentlar", suffix: "+" },
    { value: 50, label: "Ishonchli agentliklar", suffix: "+" },
    { value: 98, label: "Mijozlar mamnuniyati", suffix: "%" },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: t.home.verifiedListings,
      description: t.home.verifiedListingsDesc,
      accent: "primary",
    },
    {
      icon: TrendingUp,
      title: t.home.realPrices,
      description: t.home.realPricesDesc,
      accent: "accent",
    },
    {
      icon: Timer,
      title: "Tezkor javob",
      description: "E'lonlarga 24 soat ichida javob oling",
      accent: "gold",
    },
    {
      icon: Calculator,
      title: t.home.mortgageHelper,
      description: t.home.mortgageHelperDesc,
      accent: "success",
    },
  ];

  // City data with images
  const cityData = [
    { name: "Toshkent", count: 1240, image: prop1, featured: true },
    { name: "Samarqand", count: 456, image: prop3 },
    { name: "Buxoro", count: 312, image: prop2 },
    { name: "Andijon", count: 287, image: prop4 },
    { name: "Farg'ona", count: 234, image: prop1 },
    { name: "Namangan", count: 198, image: prop2 },
    { name: "Nukus", count: 145, image: prop3 },
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
            {/* Gradient Overlays - more cinematic */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-accent/20" />
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
          </motion.div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-20" />

          {/* Floating ambient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/4 top-1/3 size-[500px] rounded-full bg-primary/15 blur-[120px]"
            />
            <motion.div
              animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 size-[400px] rounded-full bg-accent/15 blur-[100px]"
            />
          </div>

          {/* Hero Content */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 flex min-h-[100vh] items-center"
          >
            <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 lg:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                {/* Left Content */}
                <div className="flex flex-col justify-center">
                  {/* Trust Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl"
                  >
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-sm font-medium text-white/90">
                      {listings.length}+ ta aktiv e'lon
                    </span>
                    <span className="h-4 w-px bg-white/20" />
                    <span className="text-sm text-white/70">O'zbekiston bo'ylab</span>
                  </motion.div>

                  {/* Main Heading - more sophisticated */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                  >
                    O'zingizga mos
                    <br />
                    <span className="relative inline-block">
                      <span className="text-gradient-primary">uyingizni</span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-gradient-to-r from-primary to-accent"
                      />
                    </span>{" "}
                    toping
                  </motion.h1>

                  {/* Subtitle - cleaner */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl"
                  >
                    Tekshirilgan e'lonlar, real narxlar va professional agentlar — barchasi bir platformada.
                  </motion.p>

                  {/* Feature Pills - more refined */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex flex-wrap gap-3"
                  >
                    {[
                      { icon: Verified, text: "Tekshirilgan" },
                      { icon: TrendingUp, text: "Real narxlar" },
                      { icon: Zap, text: "Tezkor javob" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm"
                      >
                        <item.icon className="size-4 text-primary" />
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
                      className="btn-shine group gap-2 rounded-full bg-white px-8 text-primary shadow-2xl shadow-white/25 hover:bg-white/95"
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
                      className="gap-2 rounded-full border border-white/20 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30"
                      asChild
                    >
                      <Link to="/elon-joylash">
                        <Sparkles className="size-5" />
                        E'lon berish
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Right - Premium Search Card */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex items-center justify-center lg:justify-end"
                >
                  <div
                    className={cn(
                      "search-card-premium relative w-full max-w-md rounded-3xl p-6 transition-all duration-500 md:p-8",
                      isSearchFocused && "scale-[1.02]"
                    )}
                  >
                    {/* Card inner glow */}
                    <div className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-primary/40 via-transparent to-accent/40 opacity-60 blur-2xl" />

                    {/* Search Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-white">
                          Qidiruv
                        </h3>
                        <p className="mt-0.5 text-sm text-white/60">
                          Orzuingizdagi uyni toping
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
                        {(["sotuv", "ijara"] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => setDeal(d)}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300",
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
                        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/40" />
                        <Input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          placeholder={t.home.searchPlaceholder}
                          className="h-14 rounded-2xl border-white/15 bg-white/10 pl-12 text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/15 transition-all"
                        />
                      </div>

                      {/* City Select */}
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-14 rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/15 transition-colors">
                          <MapPin className="mr-2 size-5 text-white/40" />
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

                      {/* Property Type Quick Filters */}
                      <div className="grid grid-cols-4 gap-2">
                        {categories.slice(0, 4).map((c) => (
                          <button
                            key={c.type}
                            type="button"
                            onClick={() => {
                              navigate({ to: "/elonlar", search: { type: c.type, deal } });
                            }}
                            className="group flex flex-col items-center gap-2 rounded-xl bg-white/8 p-3 text-white/70 transition-all hover:bg-white/15 hover:text-white"
                          >
                            <c.icon className="size-5 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-medium">{c.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="xl"
                        className="btn-shine w-full gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/90 font-semibold shadow-xl shadow-primary/30"
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
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs font-medium tracking-wide text-white/50">Pastga suring</span>
              <ChevronDown className="size-5 text-white/50" />
            </motion.div>
          </motion.div>
        </section>

        {/* ========== STATS / TRUST STRIP ========== */}
        <section className="relative z-20 -mt-20 px-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="trust-strip overflow-hidden rounded-2xl md:rounded-3xl"
            >
              <div className="trust-grid">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative flex flex-col items-center justify-center px-6 py-8 text-center md:py-10",
                      i !== stats.length - 1 && "md:border-r md:border-border/50"
                    )}
                  >
                    <p className="stat-number">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== PROPERTY CATEGORIES ========== */}
        <section className="section-padding section-tinted">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
            >
              <div>
                <span className="section-badge section-badge-primary">
                  <Sparkles className="size-3.5" />
                  Kategoriyalar
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                  {t.home.propertyTypes}
                </h2>
                <p className="mt-2 max-w-lg text-muted-foreground">
                  Har xil turdagi ko'chmas mulklarni o'rganing
                </p>
              </div>
            </motion.div>

            {/* Categories Grid - Editorial Layout */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {categories.map((c, i) => (
                <motion.div
                  key={c.type}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    i === 0 && "md:col-span-2 md:row-span-2"
                  )}
                >
                  <Link
                    to="/elonlar"
                    search={{ type: c.type }}
                    className={cn(
                      "group relative block overflow-hidden rounded-2xl md:rounded-3xl",
                      i === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-[4/3]"
                    )}
                  >
                    {/* Background Image */}
                    <motion.img
                      src={c.image}
                      alt={c.label}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700"
                      whileHover={{ scale: 1.08 }}
                    />

                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t opacity-90 transition-opacity group-hover:opacity-95",
                      c.gradient
                    )} />
                    <div className="absolute inset-0 city-card-overlay" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                      <motion.div
                        className="mb-3 flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm md:size-14"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <c.icon className={cn("text-white", i === 0 ? "size-7" : "size-6")} />
                      </motion.div>

                      <h3 className={cn(
                        "font-display font-bold text-white",
                        i === 0 ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                      )}>
                        {c.label}
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-white/80">
                          {c.count} ta e'lon
                        </p>
                        <motion.div
                          className="flex items-center gap-1 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                          initial={false}
                        >
                          Ko'rish
                          <ChevronRight className="size-4" />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FEATURED LISTINGS ========== */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
          <div className="absolute inset-0 dot-pattern" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
            >
              <div>
                <span className="section-badge section-badge-gold">
                  <Star className="size-3.5 fill-current" />
                  Premium
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                  {t.home.featuredListings}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Moderatorlar tomonidan tanlangan eng yaxshi e'lonlar
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="hidden gap-2 rounded-full border-border/60 md:flex"
                asChild
              >
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Featured listing - Hero card */}
            {featured[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <FeaturedPropertyCard listing={featured[0]} />
              </motion.div>
            )}

            {/* Grid of additional listings */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(1, 4).map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                >
                  <PropertyCard listing={l} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Button variant="outline" size="lg" className="gap-2 rounded-full" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ========== WHY UYJOY - BENEFITS ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="section-badge section-badge-accent">
                <Zap className="size-3.5" />
                Afzalliklar
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                Nima uchun UyJoy.uz?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Biz bilan ko'chmas mulk qidirish oson va ishonchli
              </p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="bento-grid mt-12">
              {features.map((f, i) => {
                const isLarge = i === 0;
                const accentColors = {
                  primary: "from-primary/15 to-primary/5 border-primary/20",
                  accent: "from-accent/15 to-accent/5 border-accent/20",
                  gold: "from-gold/15 to-gold/5 border-gold/20",
                  success: "from-success/15 to-success/5 border-success/20",
                };
                const iconColors = {
                  primary: "bg-primary/10 text-primary border-primary/20",
                  accent: "bg-accent/10 text-accent border-accent/20",
                  gold: "bg-gold/10 text-gold border-gold/20",
                  success: "bg-success/10 text-success border-success/20",
                };

                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg md:p-8",
                      accentColors[f.accent as keyof typeof accentColors],
                      isLarge && "bento-large"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn(
                        "flex items-center justify-center rounded-xl border",
                        iconColors[f.accent as keyof typeof iconColors],
                        isLarge ? "size-16" : "size-14"
                      )}
                    >
                      <f.icon className={isLarge ? "size-8" : "size-7"} />
                    </motion.div>

                    <h3 className={cn(
                      "mt-5 font-display font-bold",
                      isLarge ? "text-xl md:text-2xl" : "text-lg"
                    )}>
                      {f.title}
                    </h3>

                    <p className={cn(
                      "mt-2 leading-relaxed text-muted-foreground",
                      isLarge ? "text-base" : "text-sm"
                    )}>
                      {f.description}
                    </p>

                    {isLarge && (
                      <div className="mt-6">
                        <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                          <Link to="/haqida">
                            Batafsil
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== CITIES SECTION ========== */}
        <section className="section-padding section-warm">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                {t.home.byCity}
              </h2>
              <p className="mt-3 text-muted-foreground">
                O'zbekistonning eng yirik shaharlarida qidiring
              </p>
            </motion.div>

            {/* City Grid - Visual Cards */}
            <div className="city-grid mt-10">
              {cityData.map((city, i) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(city.featured && "city-hero")}
                >
                  <Link
                    to="/elonlar"
                    search={{ city: city.name }}
                    className={cn(
                      "group relative block overflow-hidden rounded-2xl",
                      city.featured ? "h-full min-h-[280px]" : "aspect-[4/3]"
                    )}
                  >
                    {/* Background Image */}
                    <motion.img
                      src={city.image}
                      alt={city.name}
                      className="absolute inset-0 size-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.7 }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 city-card-overlay" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className={cn(
                            "font-display font-bold text-white",
                            city.featured ? "text-2xl md:text-3xl" : "text-lg"
                          )}>
                            {city.name}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                            <MapPin className="size-3.5" />
                            {city.count}+ e'lon
                          </p>
                        </div>

                        <motion.div
                          className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm opacity-0 transition-all group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="size-5" />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="section-padding">
          <div className="mx-auto max-w-5xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl md:rounded-[2rem]"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
              <div className="absolute inset-0 hero-pattern opacity-30" />

              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-accent/20 blur-3xl" />

              {/* Grid pattern */}
              <div className="absolute inset-0 grid-pattern opacity-10" />

              <div className="relative px-6 py-16 text-center md:px-12 md:py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm md:size-20"
                >
                  <Home className="size-8 text-white md:size-10" />
                </motion.div>

                <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                  Mulkingizni bepul e'lon qiling
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-base text-white/85 md:mt-6 md:text-lg">
                  Minglab xaridorlar sizni kutmoqda. E'loningizni 3 daqiqada joylang va
                  professional agentlar yordamida tezroq soting.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:mt-10">
                  <Button
                    size="xl"
                    className="btn-shine gap-2 rounded-full bg-white px-8 text-primary shadow-xl hover:bg-white/95"
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
                    className="gap-2 rounded-full border border-white/25 px-8 text-white hover:bg-white/10"
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
        <section className="section-padding bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
            >
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                  Yangi qo'shilgan e'lonlar
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Eng so'nggi e'lonlar bilan tanishing
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="hidden gap-2 rounded-full border-border/60 md:flex"
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <PropertyCard listing={l} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
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
