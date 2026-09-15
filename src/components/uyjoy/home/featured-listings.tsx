import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useFeatured, useRecent } from "@/lib/queries";
import { FeaturedPropertyCard, PropertyCard } from "../property-card";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";
import { CardSkeleton } from "../states";

/**
 * Editorial layout: one large listing sets the tone, two smaller ones sit
 * beside it. Featured (paid) listings first; if there are none yet, the
 * newest published ones take the slot so the section never looks abandoned.
 */
export function FeaturedListings() {
  const { t } = useTranslation();
  const featured = useFeatured(3);
  const recent = useRecent(3);

  const source = featured.data && featured.data.length > 0 ? featured.data : recent.data;
  const isLoading = featured.isLoading || (featured.data?.length === 0 && recent.isLoading);

  if (!isLoading && (!source || source.length === 0)) return null;

  const [lead, ...companions] = source ?? [];

  return (
    <section className="section-y">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredListings}
            description={t.home.featuredSubtitle}
            action={
              <Button variant="outline" className="hidden gap-2 md:inline-flex" asChild>
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <div className="h-full lg:col-span-7 xl:col-span-8">
            {lead ? (
              <Reveal className="h-full">
                <FeaturedPropertyCard listing={lead} />
              </Reveal>
            ) : (
              <CardSkeleton className="min-h-[24rem] lg:min-h-[28rem]" />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 xl:col-span-4">
            {lead
              ? companions.slice(0, 2).map((listing, index) => (
                  <Reveal key={listing.id} delay={80 + index * 80} className="h-full">
                    <PropertyCard listing={listing} />
                  </Reveal>
                ))
              : [0, 1].map((i) => <CardSkeleton key={i} />)}
          </div>
        </div>

        <div className="mt-8 md:hidden">
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link to="/elonlar">
              {t.home.viewAll}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
