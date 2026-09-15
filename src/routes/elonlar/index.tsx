import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pluralForm, useTranslation } from "@/i18n";
import { cities, isDeal, isPropType, type ListingSearch, type PropType } from "@/lib/listing";
import { useListings } from "@/lib/queries";

const SORTS = ["new", "cheap", "expensive", "popular"] as const;

const toInt = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
};

export const Route = createFileRoute("/elonlar/")({
  // Every filter lives in the URL, so results are shareable and the API is
  // the single source of truth for what matches.
  validateSearch: (search: Record<string, unknown>): ListingSearch => ({
    deal: isDeal(search["deal"]) ? search["deal"] : undefined,
    city: typeof search["city"] === "string" && search["city"] ? search["city"] : undefined,
    type: isPropType(search["type"]) ? search["type"] : undefined,
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    rooms: toInt(search["rooms"]),
    minPrice: toInt(search["minPrice"]),
    maxPrice: toInt(search["maxPrice"]),
    sort: SORTS.includes(search["sort"] as never)
      ? (search["sort"] as ListingSearch["sort"])
      : undefined,
    page: toInt(search["page"]),
  }),
  head: () => ({
    meta: [
      { title: "E'lonlar — sotuv va ijara uylari | UyJoy.uz" },
      {
        name: "description",
        content:
          "O'zbekiston bo'ylab kvartira, hovli, ofis va yer uchastkalari e'lonlari. Narx, xonalar soni va hudud bo'yicha filtrlang.",
      },
      { property: "og:title", content: "E'lonlar — sotuv va ijara uylari | UyJoy.uz" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ListingsPage,
});

function ListingsPage() {
  const { t, language } = useTranslation();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = useListings(search);

  // Free-text search is debounced into the URL so every keystroke is not a request
  const [query, setQuery] = useState(search.q ?? "");
  useEffect(() => setQuery(search.q ?? ""), [search.q]);
  useEffect(() => {
    const id = setTimeout(() => {
      if ((query.trim() || undefined) !== search.q) {
        navigate({
          search: (prev) => ({ ...prev, q: query.trim() || undefined, page: undefined }),
        });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [query, search.q, navigate]);

  const setParam = <K extends keyof ListingSearch>(key: K, value: ListingSearch[K] | "all") =>
    navigate({
      search: (prev) => ({ ...prev, [key]: value === "all" ? undefined : value, page: undefined }),
    });

  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 0;
  const page = search.page ?? 1;

  const typeOptions: { value: PropType; label: string }[] = [
    { value: "kvartira", label: t.propertyType.apartments },
    { value: "hovli", label: t.propertyType.houses },
    { value: "ofis", label: t.propertyType.offices },
    { value: "yer", label: t.propertyType.lands },
    { value: "tijorat", label: t.propertyType.commercial },
  ];

  const sortLabels: Record<(typeof SORTS)[number], string> = {
    new: t.sort.newest,
    cheap: t.sort.cheapest,
    expensive: t.sort.expensive,
    popular: t.sort.popular,
  };

  const foundLabel = pluralForm(language, total, {
    one: t.home.listingsCountOne,
    few: t.home.listingsCountFew,
    many: t.home.listingsCountMany,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell flex-1 py-10">
        <h1 className="type-h1">
          {search.deal === "ijara" ? t.listings.rentListings : t.listings.saleListings}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          {isLoading ? (
            t.common.loading
          ) : (
            <>
              <span className="tnum font-semibold text-foreground">{total}</span> {foundLabel}
              {search.city ? ` — ${search.city}` : ""}
            </>
          )}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit space-y-6 rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
            <p className="flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="size-4" /> {t.filters.title}
            </p>

            <div className="space-y-2">
              <Label htmlFor="f-q">{t.common.search}</Label>
              <Input
                id="f-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.filters.dealType}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={search.deal !== "ijara" ? "default" : "soft"}
                  size="sm"
                  aria-pressed={search.deal !== "ijara"}
                  onClick={() => setParam("deal", "sotuv")}
                >
                  {t.deal.buy}
                </Button>
                <Button
                  variant={search.deal === "ijara" ? "default" : "soft"}
                  size="sm"
                  aria-pressed={search.deal === "ijara"}
                  onClick={() => setParam("deal", "ijara")}
                >
                  {t.deal.rent}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.filters.city}</Label>
              <Select value={search.city ?? "all"} onValueChange={(v) => setParam("city", v)}>
                <SelectTrigger aria-label={t.filters.city}>
                  <SelectValue placeholder={t.filters.allCities} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filters.allCities}</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.filters.propertyType}</Label>
              <Select
                value={search.type ?? "all"}
                onValueChange={(v) => setParam("type", v as PropType | "all")}
              >
                <SelectTrigger aria-label={t.filters.propertyType}>
                  <SelectValue placeholder={t.filters.allTypes} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filters.allTypes}</SelectItem>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.filters.roomsMin}</Label>
              <Select
                value={search.rooms ? String(search.rooms) : "all"}
                onValueChange={(v) => setParam("rooms", v === "all" ? "all" : Number(v))}
              >
                <SelectTrigger aria-label={t.filters.roomsMin}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filters.anyRooms}</SelectItem>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="f-min">{t.filters.minPrice}</Label>
                <Input
                  id="f-min"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  defaultValue={search.minPrice ?? ""}
                  onBlur={(e) => setParam("minPrice", toInt(e.target.value) ?? "all")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-max">{t.filters.maxPrice}</Label>
                <Input
                  id="f-max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="∞"
                  defaultValue={search.maxPrice ?? ""}
                  onBlur={(e) => setParam("maxPrice", toInt(e.target.value) ?? "all")}
                />
              </div>
            </div>

            <Button
              variant="soft"
              className="w-full"
              onClick={() => {
                setQuery("");
                navigate({ search: {} });
              }}
            >
              {t.filters.clearFilters}
            </Button>
          </aside>

          <section aria-busy={isFetching}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{t.sort.title}</p>
              <Select
                value={search.sort ?? "new"}
                onValueChange={(v) => setParam("sort", v as ListingSearch["sort"])}
              >
                <SelectTrigger className="w-52" aria-label={t.sort.title}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {sortLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isError ? (
              <ErrorState
                message={error instanceof Error ? error.message : undefined}
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : data && data.listings.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={t.listings.noResults}
                description={t.listings.noResultsDesc}
                action={
                  <Button variant="soft" asChild>
                    <Link to="/elonlar" search={{}}>
                      {t.listings.tryReset}
                    </Link>
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data?.listings.map((l) => (
                    <PropertyCard key={l.id} listing={l} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label={t.listings.pageOf}
                    className="mt-10 flex items-center justify-center gap-3"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      aria-label={t.common.previous}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="tnum text-sm text-muted-foreground">
                      {page} {t.common.of} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      aria-label={t.common.next}
                      onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
