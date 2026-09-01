import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Home, LandPlot, Warehouse } from "lucide-react";
import { listings, type PropType } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Reveal } from "../reveal";
import { useListingLabel } from "./use-listing-label";
import { SectionHeading } from "../section-heading";
import prop1 from "@/assets/prop-1.jpg";
import prop3 from "@/assets/prop-3.jpg";

/**
 * Four categories, three different treatments. Two carry photography and
 * anchor the grid; two are quiet ink tiles. Same palette throughout — the
 * character comes from scale, not from four different colours.
 */
export function PropertyCategories() {
  const { t } = useTranslation();
  const listingLabel = useListingLabel();

  const count = (type: PropType) => listings.filter((l) => l.type === type).length;

  const photo = [
    {
      type: "kvartira" as const,
      label: t.propertyType.apartments,
      icon: Building2,
      image: prop1,
      className: "sm:col-span-2 lg:col-span-5 lg:row-span-2",
      aspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
    },
    {
      type: "hovli" as const,
      label: t.propertyType.houses,
      icon: Home,
      image: prop3,
      className: "sm:col-span-2 lg:col-span-7",
      aspect: "aspect-16/10 lg:aspect-[21/8]",
    },
  ];

  const tiles = [
    {
      type: "ofis" as const,
      label: t.propertyType.offices,
      icon: Warehouse,
      span: "lg:col-span-4",
    },
    { type: "yer" as const, label: t.propertyType.lands, icon: LandPlot, span: "lg:col-span-3" },
  ];

  return (
    <section className="surface-tint section-y">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow={t.home.categoriesEyebrow}
            title={t.home.propertyTypes}
            description={t.home.categoriesSubtitle}
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {photo.map((item, index) => (
            <Reveal key={item.type} delay={index * 80} className={cn("h-full", item.className)}>
              <Link
                to="/elonlar"
                search={{ type: item.type }}
                className={cn(
                  "group relative block overflow-hidden rounded-xl bg-ink",
                  item.aspect,
                )}
              >
                <div className="media-frame absolute inset-0">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="scrim-bottom absolute inset-0" />

                <div className="relative flex h-full flex-col justify-end p-5 md:p-6">
                  <item.icon className="mb-3 size-6 text-white/70" strokeWidth={1.5} />
                  <h3 className="type-h3 text-white">{item.label}</h3>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="text-sm text-white/70">
                      <span className="tnum">{count(item.type)}</span>{" "}
                      {listingLabel(count(item.type))}
                    </p>
                    <span className="arrow-reveal text-sm font-semibold text-white">
                      {t.home.exploreCity}
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}

          {tiles.map((item, index) => (
            <Reveal key={item.type} delay={160 + index * 80} className={cn("h-full", item.span)}>
              <Link
                to="/elonlar"
                search={{ type: item.type }}
                className="group flex h-full items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/35 hover:bg-primary-soft md:p-6"
              >
                <span className="flex items-center gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block font-display text-base font-bold tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="tnum">{count(item.type)}</span>{" "}
                      {listingLabel(count(item.type))}
                    </span>
                  </span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
