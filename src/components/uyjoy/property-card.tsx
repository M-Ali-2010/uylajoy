"use client";

import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Ruler, Star, Eye, Share2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { typeLabels, type Listing } from "@/data/listings";
import { useTranslation } from "@/i18n";
import { useCurrency, formatListingPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  listing: Listing;
  variant?: "default" | "horizontal" | "compact";
  showActions?: boolean;
}

export function PropertyCard({ listing, variant = "default", showActions = true }: PropertyCardProps) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const priceDisplay = formatListingPrice(listing.price, listing.deal, currency, format);

  // Map property type to translated label
  const typeLabel = {
    kvartira: t.propertyType.apartment,
    hovli: t.propertyType.house,
    ofis: t.propertyType.office,
    yer: t.propertyType.land,
  }[listing.type] || typeLabels[listing.type];

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} - ${priceDisplay}`,
        url: `/elonlar/${listing.id}`,
      });
    }
  };

  if (variant === "horizontal") {
    return (
      <HorizontalCard
        listing={listing}
        priceDisplay={priceDisplay}
        typeLabel={typeLabel}
        isLiked={isLiked}
        onLike={handleLike}
        t={t}
      />
    );
  }

  if (variant === "compact") {
    return (
      <CompactCard
        listing={listing}
        priceDisplay={priceDisplay}
        t={t}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-500"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          {/* Image container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              src={listing.image}
              alt={`${listing.title} — ${listing.city}`}
              loading="lazy"
              width={1024}
              height={768}
              className="size-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Gradient overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge
                  variant={listing.deal === "ijara" ? "accent" : "default"}
                  className="shadow-md backdrop-blur-sm"
                >
                  {listing.deal === "ijara" ? t.deal.forRent : t.deal.sale}
                </Badge>
              </motion.div>
              {listing.featured && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="gold" className="shadow-md backdrop-blur-sm">
                    {t.property.featured}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="absolute right-3 top-3 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300",
                    isLiked
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-white/90 text-muted-foreground hover:bg-white hover:text-red-500"
                  )}
                  aria-label={t.favorites.addToFavorites}
                >
                  <Heart className={cn("size-5", isLiked && "fill-current")} />
                </motion.button>

                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="flex size-10 items-center justify-center rounded-full bg-white/90 text-muted-foreground backdrop-blur-md hover:bg-white hover:text-primary"
                      aria-label="Share"
                    >
                      <Share2 className="size-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Quick view button on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-3 left-3 right-3"
                >
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full text-white"
                  >
                    <Eye className="mr-2 size-4" />
                    Tez ko'rish
                    <ArrowUpRight className="ml-auto size-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="space-y-3 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <motion.p
                className="font-display text-xl font-extrabold text-primary"
                animate={{ scale: isHovered ? 1.02 : 1 }}
              >
                {priceDisplay}
              </motion.p>
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                <Star className="size-3.5 fill-gold text-gold" />
                {listing.rating.toFixed(1)}
              </span>
            </div>

            <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
              {listing.title}
            </h3>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.district}, {listing.city}
            </p>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
              {listing.rooms > 0 && (
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2 py-1 text-xs font-medium">
                  <BedDouble className="size-4 text-primary" /> {listing.rooms}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2 py-1 text-xs font-medium">
                <Ruler className="size-4 text-primary" /> {listing.area} m²
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2 py-1 text-xs font-medium">
                <Bath className="size-4 text-primary" /> {typeLabel}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Horizontal card variant
function HorizontalCard({
  listing,
  priceDisplay,
  typeLabel,
  isLiked,
  onLike,
  t,
}: {
  listing: Listing;
  priceDisplay: string;
  typeLabel: string;
  isLiked: boolean;
  onLike: (e: React.MouseEvent) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-float"
      >
        <div className="relative size-28 flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={listing.image}
            alt={listing.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className={cn(
              "absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full backdrop-blur-md",
              isLiked ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground"
            )}
          >
            <Heart className={cn("size-3.5", isLiked && "fill-current")} />
          </motion.button>
        </div>

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="font-display text-lg font-bold text-primary">{priceDisplay}</p>
            <h3 className="mt-1 line-clamp-1 text-sm font-medium">{listing.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {listing.district}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5" /> {listing.rooms}
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="size-3.5" /> {listing.area}m²
            </span>
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-gold text-gold" /> {listing.rating}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Compact card variant
function CompactCard({
  listing,
  priceDisplay,
  t,
}: {
  listing: Listing;
  priceDisplay: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition-colors hover:bg-secondary/50"
      >
        <div className="size-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={listing.image}
            alt={listing.title}
            className="size-full object-cover"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold">{listing.title}</p>
          <p className="text-xs text-muted-foreground">{listing.district}</p>
        </div>
        <p className="font-display text-sm font-bold text-primary">{priceDisplay}</p>
      </Link>
    </motion.div>
  );
}

// Featured property card with larger display
export function FeaturedPropertyCard({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const [isLiked, setIsLiked] = useState(false);

  const priceDisplay = formatListingPrice(listing.price, listing.deal, currency, format);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="group relative block overflow-hidden rounded-3xl"
      >
        <div className="aspect-[16/10] overflow-hidden">
          <motion.img
            src={listing.image}
            alt={listing.title}
            className="size-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="gold" className="shadow-lg">{t.property.featured}</Badge>
            <Badge variant={listing.deal === "ijara" ? "accent" : "default"}>
              {listing.deal === "ijara" ? t.deal.forRent : t.deal.sale}
            </Badge>
          </div>

          <h3 className="font-display text-2xl font-bold">{listing.title}</h3>

          <p className="mt-1 flex items-center gap-1.5 text-white/80">
            <MapPin className="size-4" />
            {listing.district}, {listing.city}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-display text-3xl font-extrabold">{priceDisplay}</p>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm">
                <BedDouble className="size-4" /> {listing.rooms}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm">
                <Ruler className="size-4" /> {listing.area}m²
              </span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "absolute right-4 top-4 flex size-12 items-center justify-center rounded-full backdrop-blur-md transition-colors",
            isLiked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/40"
          )}
        >
          <Heart className={cn("size-6", isLiked && "fill-current")} />
        </motion.button>
      </Link>
    </motion.div>
  );
}
