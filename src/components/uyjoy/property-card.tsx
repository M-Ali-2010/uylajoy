import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Ruler, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { typeLabels, type Listing } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { useCurrency, formatListingPrice } from "@/lib/currency";

export function PropertyCard({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();

  const priceDisplay = formatListingPrice(listing.price, listing.deal, currency, format);

  // Map property type to translated label
  const typeLabel = {
    kvartira: t.propertyType.apartment,
    hovli: t.propertyType.house,
    ofis: t.propertyType.office,
    yer: t.propertyType.land,
  }[listing.type] || typeLabels[listing.type];

  return (
    <Link
      to="/elonlar/$id"
      params={{ id: listing.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={`${listing.title} — ${listing.city}`}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={listing.deal === "ijara" ? "accent" : "default"}>
            {listing.deal === "ijara" ? t.deal.forRent : t.deal.sale}
          </Badge>
          {listing.featured && <Badge variant="gold">{t.property.featured}</Badge>}
        </div>
        <button
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/85 text-muted-foreground transition-colors hover:text-accent group-hover:text-accent"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Add to favorites
          }}
          aria-label={t.favorites.addToFavorites}
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-extrabold">{priceDisplay}</p>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-gold text-gold" />
            {listing.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="line-clamp-1 text-sm font-semibold">{listing.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.district}, {listing.city}
        </p>
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {listing.rooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" /> {listing.rooms} {t.property.rooms.toLowerCase()}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Ruler className="size-4" /> {listing.area} m²
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" /> {typeLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
