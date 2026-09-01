import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, ShieldCheck, Timer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

/**
 * The dark beat of the page. One lead benefit carries weight and a call to
 * action; three compact ones sit under it on a hairline grid.
 */
export function Benefits() {
  const { t } = useTranslation();

  const lead = {
    icon: ShieldCheck,
    title: t.home.verifiedListings,
    description: t.home.verifiedListingsDesc,
  };

  const rest = [
    { icon: TrendingUp, title: t.home.realPrices, description: t.home.realPricesDesc },
    { icon: Timer, title: t.home.fastResponse, description: t.home.fastResponseDesc },
    { icon: Calculator, title: t.home.mortgageHelper, description: t.home.mortgageHelperDesc },
  ];

  return (
    <section className="surface-ink section-y relative overflow-hidden">
      <div className="texture-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            eyebrow={t.home.benefitsEyebrow}
            title={t.home.benefitsTitle}
            description={t.home.benefitsSubtitle}
            tone="light"
          />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <article className="flex h-full flex-col rounded-xl border border-white/12 bg-white/[0.04] p-7 transition-colors duration-300 hover:border-white/25 md:p-9">
              <span className="flex size-12 items-center justify-center rounded-lg bg-primary-bright/15 text-primary-bright">
                <lead.icon className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="type-h2 mt-7 text-white">{lead.title}</h3>
              <p className="type-lead mt-4 text-white/60">{lead.description}</p>
              <Button variant="glass" size="lg" className="mt-8 w-fit gap-2" asChild>
                <Link to="/elonlar">
                  {t.home.learnMore}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          </Reveal>

          {/* Stacked rows, not a third column — a 235px column would break every
              one of these titles onto three lines. */}
          <div className="lg:col-span-7">
            {rest.map((item, index) => (
              <Reveal key={item.title} delay={80 + index * 70}>
                <article className="group flex gap-5 border-t border-white/10 py-7 first:border-t-0 first:pt-0 md:gap-7">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/12 text-primary-bright transition-colors duration-300 group-hover:border-primary-bright/45 group-hover:bg-primary-bright/10">
                    <item.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-[0.9375rem] leading-relaxed text-white/60">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
