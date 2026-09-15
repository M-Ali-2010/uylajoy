import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useRecent } from "@/lib/queries";
import { PropertyCard } from "../property-card";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";
import { CardSkeleton } from "../states";

/**
 * A snap rail that runs off the edge of the screen on phones and becomes a
 * 2-up / 3-up grid from tablet width. One set of markup, no carousel library.
 */
export function NewListings() {
  const { t } = useTranslation();
  const { data, isLoading } = useRecent(6);

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section className="section-y">
      <div className="shell">
        <Reveal>
          <SectionHeading
            title={t.home.newListingsTitle}
            description={t.home.newListingsSubtitle}
            action={
              <Button
                variant="ghost"
                className="gap-2 px-3 text-primary hover:bg-primary-soft"
                asChild
              >
                <Link to="/elonlar">
                  {t.home.viewAll}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
        </Reveal>

        <div className="snap-rail rail-bleed mt-10 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {(data ?? []).map((listing, index) => (
            <Reveal
              key={listing.id}
              delay={(index % 3) * 70}
              className="w-[78vw] max-w-[21rem] md:w-auto md:max-w-none"
            >
              <PropertyCard listing={listing} />
            </Reveal>
          ))}
          {isLoading &&
            [0, 1, 2].map((i) => (
              <CardSkeleton key={i} className="w-[78vw] max-w-[21rem] md:w-auto md:max-w-none" />
            ))}
        </div>
      </div>
    </section>
  );
}
