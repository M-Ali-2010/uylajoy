import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { Reveal } from "../reveal";
import cityImage from "@/assets/prop-2.jpg";

export function CtaBanner() {
  const { t } = useTranslation();

  return (
    <section className="section-y-sm">
      <div className="shell">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl bg-primary">
            {/* Architecture bleeding in from the right, dissolved into the teal */}
            <img
              src={cityImage}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-y-0 right-0 -z-10 hidden h-full w-3/5 object-cover opacity-30 mix-blend-luminosity md:block"
            />
            <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-primary from-35% via-primary/85 to-primary/25 md:block" />
            <div className="texture-lines pointer-events-none absolute inset-0 -z-10" />

            <div className="max-w-[34rem] px-6 py-12 md:max-w-[38rem] md:px-12 md:py-16 lg:px-16 lg:py-20">
              <h2 className="type-h1 text-white">{t.home.ctaTitle}</h2>
              <p className="type-lead mt-4 max-w-lg text-white/80">{t.home.ctaSubtitle}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" variant="onDark" className="lift gap-2" asChild>
                  <Link to="/elon-joylash">
                    {t.nav.postListing}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="glass" className="gap-2" asChild>
                  <Link to="/narxlar">
                    <TrendingUp className="size-4" />
                    {t.nav.marketPrices}
                  </Link>
                </Button>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm text-white/65">
                <Check className="size-4 text-white/80" />
                {t.home.ctaNote}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
