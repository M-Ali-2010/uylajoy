import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { Badge } from "@/components/ui/badge";

const market = [
  { city: "Toshkent", price: 1180, change: 6.4, rent: 8.2 },
  { city: "Samarqand", price: 720, change: 9.1, rent: 6.5 },
  { city: "Buxoro", price: 610, change: 4.8, rent: 5.4 },
  { city: "Andijon", price: 540, change: 3.2, rent: 4.9 },
  { city: "Farg'ona", price: 520, change: 2.7, rent: 4.6 },
  { city: "Namangan", price: 495, change: 3.9, rent: 4.4 },
  { city: "Nukus", price: 380, change: 1.8, rent: 3.8 },
];

export const Route = createFileRoute("/narxlar")({
  head: () => ({
    meta: [
      { title: "O'zbekiston ko'chmas mulk bozori narxlari 2026 | UyJoy.uz" },
      {
        name: "description",
        content:
          "Toshkent, Samarqand, Buxoro va boshqa shaharlarda 1 m² o'rtacha narxi, yillik o'sish va ijara daromadliligi.",
      },
      { property: "og:title", content: "Bozor narxlari — O'zbekiston ko'chmas mulki" },
      {
        property: "og:description",
        content: "Shaharlar kesimida 1 m² narxi va yillik o'zgarish dinamikasi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NarxlarPage,
});

function NarxlarPage() {
  const max = Math.max(...market.map((m) => m.price));
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14">
        <Badge variant="muted">Bozor tahlili</Badge>
        <h1 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">
          Shaharlar bo'yicha o'rtacha narxlar
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Ma'lumotlar platformadagi e'lonlar va bitimlar asosida har oy yangilanadi. Narxlar 1 m²
          uchun AQSh dollarida.
        </p>

        <div className="mt-10 space-y-4">
          {market.map((m) => (
            <div
              key={m.city}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">{m.city}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-display text-lg font-bold">${m.price}/m²</span>
                  <span className="flex items-center gap-1 text-primary">
                    <TrendingUp className="size-4" /> +{m.change}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="bg-brand h-full rounded-full" style={{ width: `${(m.price / max) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ijara daromadliligi: yiliga ~{m.rent}%
              </p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}