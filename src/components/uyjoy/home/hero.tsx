import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/data/listings";
import { useTranslation } from "@/i18n";
import heroImage from "@/assets/hero-tashkent.jpg";
import { HighlightTitle } from "./highlight-title";
import { SearchPanel } from "./search-panel";

export function Hero() {
  const { t } = useTranslation();

  const assurances = [
    { icon: ShieldCheck, label: t.home.verifiedListings },
    { icon: TrendingUp, label: t.home.realPrices },
    { icon: Zap, label: t.home.fastResponse },
  ];

  return (
    <section className="relative isolate -mt-16 flex min-h-[42rem] items-center overflow-hidden lg:-mt-18 lg:min-h-[46rem]">
      <img
        src={heroImage}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover object-[50%_62%] md:object-[center_38%]"
      />
      <div className="scrim-hero absolute inset-0 -z-10" />

      <div className="shell w-full pt-28 pb-16 md:pt-32 md:pb-20 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/8 py-1.5 pr-4 pl-2.5 text-[0.8125rem] font-medium text-white/85 backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-primary-bright opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary-bright" />
              </span>
              <span className="tnum font-semibold text-white">{listings.length}+</span>
              {t.home.heroBadge}
              <span className="hidden h-3 w-px bg-white/25 sm:block" />
              <span className="hidden text-white/60 sm:block">{t.home.heroBadgeRegion}</span>
            </p>

            <HighlightTitle
              text={t.home.heroTitle}
              highlight={t.home.heroTitleHighlight}
              className="type-display mt-6 text-white"
            />

            <p className="type-lead mt-5 max-w-xl text-white/75">{t.home.heroSubtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {assurances.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 text-[0.8125rem] font-medium text-white/70"
                >
                  <item.icon className="size-4 text-primary-bright" />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button size="lg" variant="onDark" className="lift gap-2" asChild>
                <Link to="/elonlar">
                  {t.listings.allListings}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" className="gap-2" asChild>
                <Link to="/elon-joylash">{t.nav.postListing}</Link>
              </Button>
            </div>
          </div>

          <SearchPanel className="lg:sticky lg:top-28" />
        </div>
      </div>
    </section>
  );
}
