"use client";

import { Link } from "@tanstack/react-router";
import { Home, Menu, User, Heart, Plus, Search, ChevronDown, Sparkles, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { useTranslation } from "@/i18n";
import { LanguageCurrencySelector } from "./language-currency-selector";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nav = [
    { to: "/elonlar", label: t.nav.buy, search: { deal: "sotuv" }, icon: Building2 },
    { to: "/elonlar", label: t.nav.rent, search: { deal: "ijara" }, icon: Home },
    { to: "/ipoteka", label: t.nav.mortgage, icon: Sparkles },
    { to: "/narxlar", label: t.nav.marketPrices, icon: ChevronDown },
  ] as const;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/50 bg-background/80 shadow-lg shadow-black/[0.03] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      {/* Gradient line on top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-18 lg:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex size-10 items-center justify-center"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg shadow-primary/25" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60" />
            {/* Icon */}
            <Home className="relative z-10 size-5 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-black tracking-tight">
              Uy<span className="text-gradient-primary">Joy</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground lg:block">
              Real Estate
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              search={("search" in item ? item.search : {}) as never}
              onMouseEnter={() => setActiveNav(item.label)}
              onMouseLeave={() => setActiveNav(null)}
              className="group relative px-4 py-2"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                {item.label}
              </span>
              {/* Hover background */}
              <AnimatePresence>
                {activeNav === item.label && (
                  <motion.div
                    layoutId="nav-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-secondary"
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageCurrencySelector />

          {/* Search button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-border/60 bg-secondary/50 px-4 hover:border-primary/30 hover:bg-secondary"
              asChild
            >
              <Link to="/elonlar">
                <Search className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.common.search}</span>
              </Link>
            </Button>
          </motion.div>

          {/* Favorites */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-primary"
              asChild
            >
              <Link to="/sevimlilar">
                <Heart className="size-5" />
                {/* Notification badge */}
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  3
                </span>
                <span className="sr-only">{t.nav.favorites}</span>
              </Link>
            </Button>
          </motion.div>

          {/* Post listing button */}
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-5 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              asChild
            >
              <Link to="/elon-joylash">
                <Plus className="size-4" />
                {t.nav.postListing}
              </Link>
            </Button>
          </motion.div>

          {/* User button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative overflow-hidden rounded-full border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary"
              asChild
            >
              <Link to="/kirish">
                <User className="size-5" />
                <span className="sr-only">{t.nav.login}</span>
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Menyu"
              >
                <Menu className="size-5" />
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-l border-border/50 bg-background/95 backdrop-blur-2xl">
            <SheetHeader className="border-b border-border/50 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Home className="size-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold">UyJoy.uz</span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-2">
              {nav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.to}
                      search={("search" in item ? item.search : {}) as never}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="size-4 text-primary" />
                      </div>
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/sevimlilar"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10">
                    <Heart className="size-4 text-accent" />
                  </div>
                  {t.nav.favorites}
                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    3
                  </span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  to="/kirish"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  {t.nav.login}
                </Link>
              </motion.div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4"
              >
                <LanguageCurrencySelector />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 px-4"
              >
                <Button
                  className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 py-6 font-semibold shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link to="/elon-joylash">
                    <Plus className="size-5" />
                    {t.nav.postListing}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
