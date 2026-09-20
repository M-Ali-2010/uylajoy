import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Badge } from "@/components/ui/badge";
import { pluralForm, useTranslation } from "@/i18n";

interface MarketCity {
  city: string;
  salePerSqm: number | null;
  saleCount: number;
  rentPerSqm: number | null;
  rentCount: number;
  yieldPct: number | null;
}

export const Route = createFileRoute("/narxlar")({
  head: () => ({
    meta: [
      { title: "O'zbekiston ko'chmas mulk bozori narxlari 2026 | UyJoy.uz" },
      {
        name: "description",
        content:
          "Toshkent, Samarqand, Buxoro va boshqa shaharlarda 1 m² o'rtacha narxi va ijara daromadliligi — platformadagi e'lonlar asosida.",
      },
      { property: "og:title", content: "Bozor narxlari — O'zbekiston ko'chmas mulki" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const { t, language } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["market"],
    queryFn: async () => {
      const res = await fetch("/api/properties/market");
      if (!res.ok) throw new Error(t.common.loadError);
      return (await res.json()) as { cities: MarketCity[] };
    },
    staleTime: 5 * 60_000,
  });

  const cities = data?.cities ?? [];
  const max = Math.max(1, ...cities.map((c) => c.salePerSqm ?? 0));
  const listingsWord = (n: number) =>
    pluralForm(language, n, {
      one: t.home.listingsCountOne,
      few: t.home.listingsCountFew,
      many: t.home.listingsCountMany,
    });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell max-w-5xl flex-1 py-14">
        <Badge variant="muted">{t.market.analysis}</Badge>
        <h1 className="type-h1 mt-4">{t.market.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.market.method}</p>

        <div className="mt-10 space-y-4" aria-busy={isLoading}>
          {isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            [0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
          ) : cities.length === 0 ? (
            <EmptyState icon={BarChart3} title={t.market.noData} description={t.market.empty} />
          ) : (
            cities.map((c) => (
              <article
                key={c.city}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h2 className="font-display text-lg font-bold tracking-tight">
                    <Link to="/elonlar" search={{ city: c.city }} className="hover:text-primary">
                      {c.city}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    <span className="tnum">{c.saleCount + c.rentCount}</span>{" "}
                    {listingsWord(c.saleCount + c.rentCount)} {t.market.basedOn}
                  </p>
                </div>

                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t.market.saleColumn}</dt>
                    <dd className="type-price mt-1 text-2xl">
                      {c.salePerSqm ? `$${c.salePerSqm.toLocaleString("en-US")}` : "—"}
                    </dd>
                    {c.salePerSqm && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(c.salePerSqm / max) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t.market.rentColumn}</dt>
                    <dd className="type-price mt-1 text-2xl">
                      {c.rentPerSqm ? `$${c.rentPerSqm.toLocaleString("en-US")}` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t.market.yieldColumn}</dt>
                    <dd className="type-price mt-1 text-2xl">
                      {c.yieldPct !== null ? (
                        <span className="text-primary">
                          <span className="tnum">{c.yieldPct}</span>%{" "}
                          <span className="text-sm font-medium text-muted-foreground">
                            {t.market.perYear}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
