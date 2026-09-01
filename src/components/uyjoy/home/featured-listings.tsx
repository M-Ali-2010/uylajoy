import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { FeaturedPropertyCard, PropertyCard } from "../property-card";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

/**
 * Editorial layout: one large listing sets the tone, two smaller ones sit
 * beside it. Falls back to a plain grid when there is only one featured item.
 */
export function FeaturedListings() {
  const { t } = useTranslation();

  const featured = listings.filter((l) => l.featured);
  const lead = featured[0];
  if (!lead) return null;

  const companions = featured.slice(1, 3);

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
          <Reveal className="h-full lg:col-span-7 xl:col-span-8">
            <FeaturedPropertyCard listing={lead} />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 xl:col-span-4">
            {companions.map((listing, index) => (
              <Reveal key={listing.id} delay={80 + index * 80} className="h-full">
                <PropertyCard listing={listing} />
              </Reveal>
            ))}
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
