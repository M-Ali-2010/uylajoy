"use client";

import { useNavigate } from "@tanstack/react-router";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities, type Deal, type PropType } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * The search experience — a solid paper card floating on the hero photograph.
 * Solid rather than glass: the contrast is what makes it read as a product
 * rather than decoration.
 *
 * It only ever produces the four query params the listings route already
 * understands: deal, q, city, type.
 */
export function SearchPanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<Deal>("sotuv");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");

  const types: { value: PropType; label: string }[] = [
    { value: "kvartira", label: t.propertyType.apartments },
    { value: "hovli", label: t.propertyType.houses },
    { value: "ofis", label: t.propertyType.offices },
    { value: "yer", label: t.propertyType.lands },
  ];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      to: "/elonlar",
      search: {
        deal,
        q: query.trim() || undefined,
        city: city !== "all" ? city : undefined,
        type: type !== "all" ? type : undefined,
      },
    });
  };

  const fieldClass =
    "h-12 rounded-lg border-border bg-background text-sm shadow-none transition-colors hover:border-border-strong focus:border-primary/50";

  return (
    <section
      aria-label={t.home.searchTitle}
      className={cn("search-panel-solid p-5 md:p-6", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[0.9375rem] font-bold tracking-tight whitespace-nowrap">
          {t.home.searchTitle}
        </h2>

        <div
          role="group"
          aria-label={t.filters.dealType}
          className="segmented shrink-0 bg-secondary"
        >
          {(["sotuv", "ijara"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={deal === value}
              onClick={() => setDeal(value)}
              className={cn(
                "segmented-item",
                deal === value
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "sotuv" ? t.deal.buy : t.deal.rent}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{t.home.searchSubtitle}</p>

      <form onSubmit={submit} className="mt-4 space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.15rem] -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="hero-search" className="sr-only">
            {t.home.searchPlaceholder}
          </label>
          <Input
            id="hero-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.home.searchPlaceholder}
            className={cn(fieldClass, "pl-11")}
          />
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger aria-label={t.filters.city} className={cn(fieldClass, "px-3.5")}>
              <span className="flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder={t.filters.allCities} />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.allCities}</SelectItem>
              {cities.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label={t.filters.propertyType} className={cn(fieldClass, "px-3.5")}>
              <SelectValue placeholder={t.filters.allTypes} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.allTypes}</SelectItem>
              {types.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-1.5">
          <Button type="submit" size="lg" className="lift w-full gap-2">
            <Search className="size-4" />
            {t.common.search}
          </Button>

          <button
            type="button"
            onClick={() => navigate({ to: "/elonlar", search: { deal } })}
            className="mt-3 flex w-full items-center justify-center gap-2 text-[0.8125rem] font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <SlidersHorizontal className="size-3.5" />
            {t.home.searchAdvanced}
          </button>
        </div>
      </form>
    </section>
  );
}
