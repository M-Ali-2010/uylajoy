import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { RequireAuth } from "@/components/uyjoy/require-auth";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import { pluralForm, useTranslation } from "@/i18n";
import { useFavorites } from "@/lib/queries";

export const Route = createFileRoute("/sevimlilar")({
  head: () => ({
    meta: [
      { title: "Sevimlilar — UyJoy.uz" },
      { name: "description", content: "Saqlangan e'lonlaringiz" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FavoritesPage />
    </RequireAuth>
  ),
});

function FavoritesPage() {
  const { t, language } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useFavorites();

  const count = data?.length ?? 0;
  const label = pluralForm(language, count, {
    one: t.home.listingsCountOne,
    few: t.home.listingsCountFew,
    many: t.home.listingsCountMany,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell flex-1 py-10">
        <h1 className="type-h1">{t.favorites.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading ? (
            t.common.loading
          ) : (
            <>
              <span className="tnum font-semibold text-foreground">{count}</span> {label}
            </>
          )}
        </p>

        <div className="mt-8">
          {isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : count === 0 ? (
            <EmptyState
              icon={Heart}
              title={t.favorites.empty}
              description={t.favorites.emptyDesc}
              action={
                <Button asChild>
                  <Link to="/elonlar">{t.listings.allListings}</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.map((f) => (
                <PropertyCard key={f.id} listing={f.listing} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
