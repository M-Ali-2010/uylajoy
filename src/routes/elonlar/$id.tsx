import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  MapPin,
  Phone,
  Ruler,
  Share2,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getListing, listings, typeLabels } from "@/data/listings";

export const Route = createFileRoute("/elonlar/$id")({
  loader: ({ params }) => {
    const listing = getListing(params.id);
    if (!listing) throw notFound();
    return listing;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — ${formatPrice(loaderData)}` : "E'lon";
    const description = loaderData?.description.slice(0, 155) ?? "UyJoy.uz e'loni";
    return {
      meta: [
        { title: `${title} | UyJoy.uz` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ListingPage,
});

function ListingPage() {
  const l = Route.useLoaderData();
  const similar = listings.filter((x) => x.id !== l.id && x.type === l.type).slice(0, 3);
  const monthly = Math.round(((l.price * 0.8) * 0.014) / (1 - Math.pow(1.014, -180)));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Bosh sahifa
          </Link>{" "}
          /{" "}
          <Link to="/elonlar" className="hover:text-foreground">
            E'lonlar
          </Link>{" "}
          / <span className="text-foreground">{l.city}</span>
        </nav>

        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={l.image}
            alt={`${l.title}, ${l.address}`}
            width={1024}
            height={768}
            className="h-[300px] w-full object-cover md:h-[460px]"
          />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={l.deal === "ijara" ? "accent" : "default"}>
                {l.deal === "ijara" ? "Ijaraga" : "Sotuvda"}
              </Badge>
              <Badge variant="muted">{typeLabels[l.type]}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-gold text-gold" /> {l.rating.toFixed(1)} reyting
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">{l.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {l.address}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:grid-cols-4">
              <Stat icon={<BedDouble className="size-4" />} label="Xonalar" value={l.rooms || "—"} />
              <Stat icon={<Ruler className="size-4" />} label="Maydon" value={`${l.area} m²`} />
              <Stat
                icon={<Building2 className="size-4" />}
                label="Qavat"
                value={l.floors ? `${l.floor}/${l.floors}` : "—"}
              />
              <Stat
                icon={<CalendarDays className="size-4" />}
                label="Qurilgan yil"
                value={l.year || "—"}
              />
            </div>

            <h2 className="mt-10 font-display text-xl font-bold">Tavsif</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{l.description}</p>

            <h2 className="mt-10 font-display text-xl font-bold">Qulayliklar</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {l.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-primary">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 shadow-float lg:sticky lg:top-24">
            <div>
              <p className="font-display text-3xl font-extrabold">{formatPrice(l)}</p>
              {l.deal === "sotuv" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ipoteka bilan taxminan ${monthly.toLocaleString("en-US")}/oy (20% boshlang'ich, 15
                  yil)
                </p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold">{l.agent.name}</p>
              <p className="text-xs text-muted-foreground">{l.agent.agency}</p>
            </div>
            <Button variant="hero" size="xl" className="w-full" asChild>
              <a href={`tel:${l.agent.phone.replace(/\s/g, "")}`}>
                <Phone /> {l.agent.phone}
              </a>
            </Button>
            <Button variant="soft" className="w-full" asChild>
              <Link to="/ipoteka">Ipotekani hisoblash</Link>
            </Button>
            <Button variant="ghost" className="w-full">
              <Share2 /> Ulashish
            </Button>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold">O'xshash e'lonlar</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} listing={s} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}