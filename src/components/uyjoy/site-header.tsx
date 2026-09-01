"use client";

import { Link } from "@tanstack/react-router";
import {
  Building2,
  Calculator,
  Heart,
  Home,
  Menu,
  Plus,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { BrandLockup } from "./brand-mark";
import { LanguageCurrencySelector } from "./language-currency-selector";

/**
 * Two states:
 *  - overlay  — sitting on top of the hero photograph, white content, no chrome
 *  - solid    — after the hero, a blurred paper surface with one hairline
 *
 * Driven by a passive scroll listener that does one number comparison and only
 * touches state when the state actually changes. An IntersectionObserver would
 * be marginally cheaper, but if it ever failed to deliver the header would stay
 * transparent over light content — white nav on a white page.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { t } = useTranslation();
  const [pinned, setPinned] = useState(!overlay);
  const pinnedRef = useRef(!overlay);

  useEffect(() => {
    if (!overlay) {
      setPinned(true);
      return;
    }

    const sync = () => {
      const next = window.scrollY > 8;
      if (next === pinnedRef.current) return;
      pinnedRef.current = next;
      setPinned(next);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [overlay]);

  // The top bar uses short labels — "Ипотечный калькулятор" alone is 170px and
  // pushes the primary CTA off the row on a 1024px laptop. The full wording
  // stays in the mobile sheet and the footer.
  const nav = [
    {
      to: "/elonlar",
      label: t.nav.buy,
      full: t.nav.buy,
      search: { deal: "sotuv" },
      icon: Building2,
    },
    { to: "/elonlar", label: t.nav.rent, full: t.nav.rent, search: { deal: "ijara" }, icon: Home },
    { to: "/ipoteka", label: t.nav.mortgageShort, full: t.nav.mortgage, icon: Calculator },
    { to: "/narxlar", label: t.nav.marketPrices, full: t.nav.marketPrices, icon: TrendingUp },
  ] as const;

  const light = overlay && !pinned;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          pinned
            ? "border-b border-border/70 bg-background/80 shadow-[0_1px_0_var(--color-border)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
            : "border-b border-white/10 bg-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 lg:h-18">
          <Link to="/" className="group -mx-1 shrink-0 rounded-lg px-1 py-1" aria-label="UyJoy.uz">
            <BrandLockup tone={light ? "light" : "default"} />
          </Link>

          <nav aria-label="Asosiy menyu" className="hidden items-center gap-6 lg:flex xl:gap-8">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={("search" in item ? item.search : {}) as never}
                className={cn(
                  "link-underline text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                  light
                    ? "text-white/80 hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <LanguageCurrencySelector tone={light ? "light" : "default"} />

            <span className={cn("mx-2 h-5 w-px", light ? "bg-white/20" : "bg-border")} />

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden xl:inline-flex",
                light && "text-white/80 hover:bg-white/10 hover:text-white",
              )}
              asChild
            >
              <Link to="/elonlar" aria-label={t.common.search}>
                <Search className="size-[1.15rem]" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative",
                light && "text-white/80 hover:bg-white/10 hover:text-white",
              )}
              asChild
            >
              <Link to="/sevimlilar" aria-label={t.nav.favorites}>
                <Heart className="size-[1.15rem]" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("mr-1", light && "text-white/80 hover:bg-white/10 hover:text-white")}
              asChild
            >
              <Link to="/kirish" aria-label={t.nav.login}>
                <User className="size-[1.15rem]" />
              </Link>
            </Button>

            <Button variant={light ? "onDark" : "default"} className="lift gap-1.5 pl-3.5" asChild>
              <Link to="/elon-joylash">
                <Plus className="size-4" />
                {t.nav.postListing}
              </Link>
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(light && "text-white hover:bg-white/10")}
              asChild
            >
              <Link to="/sevimlilar" aria-label={t.nav.favorites}>
                <Heart className="size-[1.15rem]" />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menyu"
                  className={cn(light && "text-white hover:bg-white/10")}
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[88vw] max-w-sm flex-col border-l border-border p-0"
              >
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                  <SheetTitle asChild>
                    <span>
                      <BrandLockup />
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav aria-label="Mobil menyu" className="flex flex-col px-3 py-4">
                  {nav.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={("search" in item ? item.search : {}) as never}
                      className="group flex items-center gap-3 rounded-lg px-3 py-3 text-[0.9375rem] font-semibold transition-colors hover:bg-secondary"
                    >
                      <item.icon className="size-[1.15rem] text-primary" />
                      {item.full}
                    </Link>
                  ))}
                </nav>

                <div className="mx-3 h-px bg-border" />

                <div className="flex flex-col px-3 py-4">
                  <Link
                    to="/sevimlilar"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Heart className="size-[1.15rem]" />
                    {t.nav.favorites}
                  </Link>
                  <Link
                    to="/kirish"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <User className="size-[1.15rem]" />
                    {t.nav.login}
                  </Link>
                </div>

                <div className="mt-auto space-y-4 border-t border-border px-5 py-5">
                  <LanguageCurrencySelector />
                  <Button className="w-full gap-1.5" size="lg" asChild>
                    <Link to="/elon-joylash">
                      <Plus className="size-4" />
                      {t.nav.postListing}
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
