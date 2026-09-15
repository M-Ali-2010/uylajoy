import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  Building2,
  CalendarDays,
  Check,
  Eye,
  Layers,
  MapPin,
  Ruler,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { ContactPanel } from "@/components/uyjoy/property/contact-panel";
import { Gallery } from "@/components/uyjoy/property/gallery";
import { NotFoundState } from "@/components/uyjoy/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { formatListingPrice, useCurrency } from "@/lib/currency";
import { toListing, type ApiProperty, type Listing } from "@/lib/listing";
import { useListing } from "@/lib/queries";

/**
 * Loads a published listing on the server so the page has real
 * title/description/og:image when a link is shared. Anything unpublished is
 * not available to the anonymous loader; the owner's own preview comes from
 * the authenticated client query below.
 */
const loadPublicListing = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { getPropertyById, getSimilarProperties } = await import("@/lib/server/properties");
    const property = await getPropertyById(id, true, null);
    if (!property) return null;
    const similar = await getSimilarProperties(id, 3);
    const listing = toListing(property as unknown as ApiProperty);
    // Link previews need an absolute image URL; local /images/* paths get the site origin
    const origin = (process.env["APP_URL"] ?? "").replace(/\/$/, "");
    const ogImage = listing.image.startsWith("http")
      ? listing.image
      : origin
        ? origin + listing.image
        : null;
    return {
      listing,
      similar: similar.map((p) => toListing(p as unknown as ApiProperty)),
      ogImage,
    };
  });

export const Route = createFileRoute("/elonlar/$id")({
  loader: ({ params }) => loadPublicListing({ data: params.id }),
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    const title = l
      ? `${l.title} — ${l.deal === "ijara" ? `$${l.price}/oy` : `$${l.price.toLocaleString("en-US")}`}`
      : "E'lon";
    const description = l?.description.slice(0, 155) ?? "UyJoy.uz e'loni";
    return {
      meta: [
        { title: `${title} | UyJoy.uz` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(loaderData?.ogImage && !loaderData.ogImage.endsWith(".svg")
          ? [{ property: "og:image", content: loaderData.ogImage }]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(l ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const loaded = Route.useLoaderData();
  const { t } = useTranslation();

  // Owner / admin preview of an unpublished listing goes through the API with
  // the session token; everyone else already has the server-rendered data.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fallback = useListing(id);
  const needsFallback = !loaded && isAuthenticated;

  const listing = loaded?.listing ?? (needsFallback ? fallback.data?.listing : undefined);
  const similar = loaded?.similar ?? fallback.data?.similar ?? [];

  if (!listing) {
    const stillResolving = !loaded && (isLoading || (needsFallback && fallback.isLoading));
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {stillResolving ? (
            <div className="shell py-24" aria-busy="true">
              <div className="h-[300px] animate-pulse rounded-xl bg-muted md:h-[460px]" />
            </div>
          ) : (
            <NotFoundState
              title={t.property.notFound}
              description={t.property.notFoundDesc}
              backTo="/elonlar"
              backLabel={t.property.backToListings}
            />
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <ListingView listing={listing} similar={similar} />;
}

function ListingView({ listing: l, similar }: { listing: Listing; similar: Listing[] }) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const price = formatListingPrice(l.price, l.deal, currency, format);
  const typeLabel = {
    kvartira: t.propertyType.apartment,
    hovli: t.propertyType.house,
    ofis: t.propertyType.office,
    yer: t.propertyType.land,
    tijorat: t.propertyType.commercial,
  }[l.type];
  const isOwner = user?.id === l.ownerId;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: l.title, text: `${l.title} — ${price}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell flex-1 py-8">
        <nav aria-label="breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {t.nav.home}
          </Link>{" "}
          /{" "}
          <Link to="/elonlar" className="hover:text-foreground">
            {t.nav.listings}
          </Link>{" "}
          /{" "}
          <Link to="/elonlar" search={{ city: l.city }} className="hover:text-foreground">
            {l.city}
          </Link>
        </nav>

        {l.status !== "active" && (
          <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm">
            {t.dashboard[
              `status${l.status.charAt(0).toUpperCase()}${l.status.slice(1)}` as "statusPending"
            ] ?? l.status}
            {l.rejectionReason ? ` — ${l.rejectionReason}` : ""}
          </p>
        )}

        <Gallery images={l.images} title={l.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={l.deal === "ijara" ? "accent" : "default"}>
                {l.deal === "ijara" ? t.deal.forRent : t.deal.sale}
              </Badge>
              <Badge variant="muted">{typeLabel}</Badge>
              {l.verified && (
                <Badge variant="success" title={t.property.verifiedHint}>
                  <ShieldCheck className="size-3" /> {t.property.verified}
                </Badge>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" /> <span className="tnum">{l.viewCount}</span>{" "}
                {t.property.views}
              </span>
            </div>

            <h1 className="type-h1 mt-4">{l.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {l.district}, {l.city} · {l.address}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-4">
              <Stat
                icon={<Building2 className="size-4" />}
                label={t.property.rooms}
                value={l.rooms || "—"}
              />
              <Stat
                icon={<Ruler className="size-4" />}
                label={t.property.area}
                value={`${l.area} m²`}
              />
              <Stat
                icon={<Layers className="size-4" />}
                label={t.property.floor}
                value={l.floors ? `${l.floor}/${l.floors}` : "—"}
              />
              <Stat
                icon={<CalendarDays className="size-4" />}
                label={t.property.yearBuilt}
                value={l.year || "—"}
              />
            </div>

            <h2 className="type-h3 mt-10">{t.property.description}</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">
              {l.description}
            </p>

            {l.features.length > 0 && (
              <>
                <h2 className="type-h3 mt-10">{t.property.amenities}</h2>
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
              </>
            )}
          </div>

          <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 shadow-float lg:sticky lg:top-24">
            <div>
              <p className="type-price text-3xl">{price}</p>
              {l.deal === "sotuv" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.property.mortgageEstimate} ${estimateMonthly(l.price).toLocaleString("en-US")}
                  {t.property.perMonth} (20% {t.property.downPayment}, 15 {t.property.years})
                </p>
              )}
            </div>

            <ContactPanel listing={l} isOwner={isOwner} />

            <Button variant="soft" className="w-full" asChild>
              <Link to="/ipoteka">{t.property.calculateMortgage}</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={share}>
              <Share2 /> {copied ? "✓" : t.property.share}
            </Button>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="type-h2">{t.property.similar}</h2>
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

/** Rough annuity: 80% financed, 17%/yr over 15 years. Labelled as an estimate. */
function estimateMonthly(price: number) {
  const r = 0.17 / 12;
  const n = 180;
  return Math.round((price * 0.8 * r) / (1 - Math.pow(1 + r, -n)));
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
      <p className="tnum mt-1 font-semibold">{value}</p>
    </div>
  );
}
