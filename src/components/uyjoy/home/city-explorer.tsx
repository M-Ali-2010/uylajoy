import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cities, listings } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { Reveal } from "../reveal";
import { useListingLabel } from "./use-listing-label";
import { SectionHeading } from "../section-heading";
import heroImage from "@/assets/hero-tashkent.jpg";

/**
 * Tashkent leads with the only photograph we can honestly attribute to a city;
 * the rest are a typographic index. Counts come from the real dataset, so a
 * region with nothing listed says "explore" rather than inventing a number.
 */
export function CityExplorer() {
  const { t } = useTranslation();
  const listingLabel = useListingLabel();

  const countFor = (name: string) => listings.filter((l) => l.city === name).length;

  const [lead, ...others] = cities;
  const leadCount = countFor(lead);

  return (
    <section className="surface-warm section-y">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow={t.home.citiesEyebrow}
            title={t.home.byCity}
            description={t.home.citiesSubtitle}
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Link
              to="/elonlar"
              search={{ city: lead }}
              className="group relative block h-full min-h-[16rem] overflow-hidden rounded-xl bg-ink"
            >
              <div className="media-frame absolute inset-0">
                <img src={heroImage} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="scrim-bottom absolute inset-0" />

              <div className="relative flex h-full flex-col justify-end p-6 md:p-7">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
                  <MapPin className="size-3.5" />
                  {t.home.citiesEyebrow}
                </p>
                <h3 className="type-h2 mt-2 text-white">{lead}</h3>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-white/75">
                    <span className="tnum">{leadCount}</span> {listingLabel(leadCount)}
                  </p>
                  <span className="arrow-reveal text-sm font-semibold text-white">
                    {t.home.exploreCity}
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7">
            <ul className="grid h-full grid-cols-1 gap-x-8 sm:grid-cols-2">
              {others.map((city) => {
                const total = countFor(city);
                return (
                  <li
                    key={city}
                    className="border-b border-border last:border-b-0 sm:last:border-b"
                  >
                    <Link
                      to="/elonlar"
                      search={{ city }}
                      className="group flex items-baseline justify-between gap-4 py-4 transition-colors md:py-[1.15rem]"
                    >
                      <span className="font-display text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary md:text-xl">
                        {city}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {total > 0 ? (
                            <>
                              <span className="tnum">{total}</span> {listingLabel(total)}
                            </>
                          ) : (
                            t.home.exploreCity
                          )}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-primary" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
