"use client";

import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Heart, Layers, MapPin, Ruler, Star } from "lucide-react";
import { useState } from "react";
import { typeLabels, type Listing } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { formatListingPrice, useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * One card system for every surface that shows a listing.
 *
 * Hierarchy is fixed across all variants: price first, title second,
 * everything else third. The whole card is a single link (stretched over the
 * card via a pseudo-element) so the favourite control can stay a real button
 * instead of being nested inside an anchor.
 */

interface PropertyCardProps {
  listing: Listing;
  variant?: "default" | "horizontal" | "compact";
  showActions?: boolean;
  /** Above-the-fold cards skip lazy loading. */
  priority?: boolean;
}

function useListingMeta(listing: Listing) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();

  const price = formatListingPrice(listing.price, listing.deal, currency, format);
  const typeLabel =
    {
      kvartira: t.propertyType.apartment,
      hovli: t.propertyType.house,
      ofis: t.propertyType.office,
      yer: t.propertyType.land,
    }[listing.type] ?? typeLabels[listing.type];

  return { t, price, typeLabel };
}

function FavouriteButton({
  listing,
  className,
  size = "default",
}: {
  listing: Listing;
  className?: string;
  size?: "default" | "sm";
}) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      data-active={saved}
      aria-pressed={saved}
      aria-label={saved ? t.favorites.removeFromFavorites : t.favorites.addToFavorites}
      onClick={() => setSaved((v) => !v)}
      className={cn("media-action relative z-20", size === "sm" ? "size-8" : "size-9", className)}
    >
      <Heart
        className={cn(size === "sm" ? "size-4" : "size-[1.125rem]", saved && "fill-current")}
      />
    </button>
  );
}

function DealBadge({ listing, tone = "media" }: { listing: Listing; tone?: "media" | "flat" }) {
  const { t } = useTranslation();
  const isRent = listing.deal === "ijara";

  return (
    <span
      className={cn(
        "pill-on-media",
        tone === "media"
          ? isRent
            ? "bg-accent/92 text-accent-foreground"
            : "bg-white/92 text-ink"
          : isRent
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground",
      )}
    >
      {isRent ? t.deal.forRent : t.deal.sale}
    </span>
  );
}

function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", className)}>
      <Star className="size-3.5 fill-gold text-gold" />
      <span className="tnum">{value.toFixed(1)}</span>
    </span>
  );
}

export function PropertyCard({
  listing,
  variant = "default",
  showActions = true,
  priority = false,
}: PropertyCardProps) {
  const { t, price, typeLabel } = useListingMeta(listing);

  if (variant === "horizontal") {
    return (
      <article className="group card-surface relative flex gap-4 overflow-hidden p-3">
        <div className="media-frame size-28 shrink-0 rounded-lg">
          <img src={listing.image} alt="" loading="lazy" decoding="async" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="min-w-0">
            <p className="type-price text-lg text-foreground">{price}</p>
            <h3 className="mt-1 truncate text-sm font-semibold">
              <Link
                to="/elonlar/$id"
                params={{ id: listing.id }}
                className="after:absolute after:inset-0 hover:text-primary"
              >
                {listing.title}
              </Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {listing.district}, {listing.city}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {listing.rooms > 0 && (
              <span className="tnum">
                {listing.rooms} · {t.property.rooms}
              </span>
            )}
            <span className="tnum">{listing.area} m²</span>
            <Rating value={listing.rating} className="text-xs" />
          </div>
        </div>

        {showActions && (
          <FavouriteButton listing={listing} size="sm" className="absolute top-3 right-3" />
        )}
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group relative flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary/60">
        <div className="media-frame size-14 shrink-0 rounded-md">
          <img src={listing.image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">
            <Link
              to="/elonlar/$id"
              params={{ id: listing.id }}
              className="after:absolute after:inset-0 hover:text-primary"
            >
              {listing.title}
            </Link>
          </h3>
          <p className="truncate text-xs text-muted-foreground">{listing.district}</p>
        </div>
        <p className="type-price shrink-0 text-sm text-primary">{price}</p>
      </article>
    );
  }

  return (
    <article className="group card-surface relative flex h-full flex-col overflow-hidden">
      <div className="media-frame aspect-[4/3]">
        <img
          src={listing.image}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
        {/* Only enough scrim to keep the badges legible on a bright photo */}
        <div className="scrim-soft pointer-events-none absolute inset-x-0 top-0 h-24 rotate-180 opacity-70" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <DealBadge listing={listing} />
          {listing.featured && (
            <span className="pill-on-media bg-ink/80 text-white">{t.property.premium}</span>
          )}
        </div>

        {showActions && (
          <FavouriteButton listing={listing} className="absolute top-2.5 right-2.5" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="type-price text-2xl text-foreground">{price}</p>
          <Rating value={listing.rating} className="mt-1 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-1 text-[0.9375rem] font-semibold transition-colors group-hover:text-primary">
            <Link
              to="/elonlar/$id"
              params={{ id: listing.id }}
              className="after:absolute after:inset-0"
            >
              {listing.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">
              {listing.district}, {listing.city}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-border pt-3.5">
          {listing.rooms > 0 && (
            <span className="meta-chip">
              <Building2 className="size-3.5 text-primary/70" />
              <span className="tnum">{listing.rooms}</span> {t.property.rooms.toLowerCase()}
            </span>
          )}
          <span className="meta-chip">
            <Ruler className="size-3.5 text-primary/70" />
            <span className="tnum">{listing.area}</span> m²
          </span>
          {listing.floor > 0 && (
            <span className="meta-chip">
              <Layers className="size-3.5 text-primary/70" />
              <span className="tnum">{listing.floor}</span>/
              <span className="tnum">{listing.floors}</span>
            </span>
          )}
          <span className="meta-chip border-transparent bg-secondary">{typeLabel}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * The editorial card that opens the featured section. Text sits on the
 * photograph, so it carries its own gradient and larger type.
 */
export function FeaturedPropertyCard({ listing }: { listing: Listing }) {
  const { t, price, typeLabel } = useListingMeta(listing);

  return (
    <article className="group relative isolate flex h-full min-h-[24rem] flex-col overflow-hidden rounded-2xl bg-ink lg:min-h-[28rem]">
      <div className="media-frame absolute inset-0">
        <img src={listing.image} alt="" loading="lazy" decoding="async" />
      </div>

      {/* Enough darkening at the top for the badges, nothing more */}
      <div className="scrim-soft pointer-events-none absolute inset-x-0 top-0 h-28 rotate-180" />

      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 md:top-6 md:left-6">
        <DealBadge listing={listing} />
        {listing.featured && (
          <span className="pill-on-media bg-white/92 text-ink">{t.property.premium}</span>
        )}
      </div>

      <FavouriteButton listing={listing} className="absolute top-3.5 right-4 md:top-5 md:right-6" />

      {/* The scrim rides the copy block rather than the card, so a title that
          wraps to three lines on a phone still lands on a dark ground. */}
      <div className="scrim-copy relative mt-auto flex w-full flex-col justify-end p-5 pt-20 text-white md:p-8 md:pt-24 lg:p-10 lg:pt-28">
        <div className="max-w-2xl">
          <p className="flex items-center gap-1.5 text-sm text-white/75">
            <MapPin className="size-4" />
            {listing.district}, {listing.city}
          </p>

          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.25rem] lg:leading-[1.12]">
            <Link
              to="/elonlar/$id"
              params={{ id: listing.id }}
              className="after:absolute after:inset-0"
            >
              {listing.title}
            </Link>
          </h3>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <p className="type-price text-3xl text-white md:text-[2.5rem]">{price}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              {listing.rooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4 text-white/60" />
                  <span className="tnum">{listing.rooms}</span> {t.property.rooms.toLowerCase()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Ruler className="size-4 text-white/60" />
                <span className="tnum">{listing.area}</span> m²
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4 text-white/60" />
                {typeLabel}
              </span>
              <Rating value={listing.rating} className="text-white" />
            </div>
          </div>

          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
            {t.home.viewDetails}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
