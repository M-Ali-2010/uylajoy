import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { useTranslation } from "@/i18n";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ipoteka")({
  head: () => ({
    meta: [
      { title: "Ipoteka kalkulyatori — oylik to'lovni hisoblang | UyJoy.uz" },
      {
        name: "description",
        content:
          "O'zbekiston banklari shartlari asosida ipoteka oylik to'lovini, umumiy foizni va to'lov jadvalini hisoblang.",
      },
      { property: "og:title", content: "Ipoteka kalkulyatori | UyJoy.uz" },
      {
        property: "og:description",
        content: "Uy narxi, boshlang'ich to'lov va muddatga qarab oylik to'lovni hisoblang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IpotekaPage,
});

function IpotekaPage() {
  const [price, setPrice] = useState(80000);
  const [downPct, setDownPct] = useState(25);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(17);

  const { monthly, total, interest, loan } = useMemo(() => {
    const loanAmount = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    const m = r === 0 ? loanAmount / n : (loanAmount * r) / (1 - Math.pow(1 + r, -n));
    return {
      loan: loanAmount,
      monthly: m,
      total: m * n,
      interest: m * n - loanAmount,
    };
  }, [price, downPct, years, rate]);

  const { t } = useTranslation();
  const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell max-w-5xl py-14">
        <h1 className="type-h1">{t.mortgage.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.mortgage.subtitle}</p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-3">
              <Label>
                {t.mortgage.propertyPrice}: {usd(price)}
              </Label>
              <Slider
                value={[price]}
                min={20000}
                max={400000}
                step={1000}
                onValueChange={(v) => setPrice(v[0] ?? price)}
              />
            </div>
            <div className="space-y-3">
              <Label>
                {t.mortgage.downPayment}: {downPct}% ({usd((price * downPct) / 100)})
              </Label>
              <Slider
                value={[downPct]}
                min={0}
                max={70}
                step={5}
                onValueChange={(v) => setDownPct(v[0] ?? downPct)}
              />
            </div>
            <div className="space-y-3">
              <Label>
                {t.mortgage.loanTerm}: {years} {t.property.years}
              </Label>
              <Slider
                value={[years]}
                min={3}
                max={30}
                step={1}
                onValueChange={(v) => setYears(v[0] ?? years)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="rate">{t.mortgage.interestRate} (%)</Label>
              <Input
                id="rate"
                type="number"
                value={rate}
                min={1}
                max={40}
                step={0.5}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-6 shadow-float">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t.mortgage.monthlyPayment}
            </p>
            <p className="font-display text-4xl font-extrabold text-primary">{usd(monthly)}</p>
            <dl className="space-y-3 border-t border-border pt-4 text-sm">
              <Row label={t.mortgage.loanAmount} value={usd(loan)} />
              <Row label={t.mortgage.totalPayment} value={usd(total)} />
              <Row label={t.mortgage.totalInterest} value={usd(interest)} />
            </dl>
            <p className="text-xs text-muted-foreground">{t.mortgage.disclaimer}</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
