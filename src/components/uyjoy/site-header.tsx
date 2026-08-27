import { Link } from "@tanstack/react-router";
import { Home, Menu, User, Heart, Bell } from "lucide-react";
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

export function SiteHeader() {
  const { t } = useTranslation();

  const nav = [
    { to: "/elonlar", label: t.nav.buy, search: { deal: "sotuv" } },
    { to: "/elonlar", label: t.nav.rent, search: { deal: "ijara" } },
    { to: "/ipoteka", label: t.nav.mortgage },
    { to: "/narxlar", label: t.nav.marketPrices },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Home className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">UyJoy.uz</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              search={("search" in item ? item.search : {}) as never}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageCurrencySelector />

          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/sevimlilar">
              <Heart className="size-5" />
              <span className="sr-only">{t.nav.favorites}</span>
            </Link>
          </Button>

          <Button variant="soft" asChild>
            <Link to="/elonlar">{t.common.search}</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/elon-joylash">{t.nav.postListing}</Link>
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/kirish">
              <User className="size-5" />
              <span className="sr-only">{t.nav.login}</span>
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menyu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-display">UyJoy.uz</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {nav.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  search={("search" in item ? item.search : {}) as never}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-4 border-t border-border" />
              <Link
                to="/sevimlilar"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Heart className="size-4" />
                {t.nav.favorites}
              </Link>
              <Link
                to="/kirish"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <User className="size-4" />
                {t.nav.login}
              </Link>
              <div className="my-4 border-t border-border" />
              <div className="px-3 py-2">
                <LanguageCurrencySelector />
              </div>
              <Button variant="hero" className="mt-4" asChild>
                <Link to="/elon-joylash">{t.nav.postListing}</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
