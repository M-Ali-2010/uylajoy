import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { PropertyCard } from "../property-card";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

/**
 * A snap rail that runs off the edge of the screen on phones and becomes a
 * 2-up / 3-up grid from tablet width. One set of markup, no carousel library.
 */
export function NewListings() {
  const { t } = useTranslation();
  const recent = listings.slice(0, 6);

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
          {recent.map((listing, index) => (
            <Reveal
              key={listing.id}
              delay={(index % 3) * 70}
              className="w-[78vw] max-w-[21rem] md:w-auto md:max-w-none"
            >
              <PropertyCard listing={listing} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
