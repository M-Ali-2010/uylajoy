"use client";

import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Ruler, Star, Share2, ArrowUpRight, Sparkles, Building2 } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(false);

  const priceDisplay = formatListingPrice(listing.price, listing.deal, currency, format);

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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="block h-full"
      >
        <motion.article
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="card-elevated relative h-full overflow-hidden"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Skeleton loader */}
            <AnimatePresence>
              {!imageLoaded && (
                <motion.div
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 animate-pulse bg-secondary"
                />
              )}
            </AnimatePresence>

            {/* Image */}
            <motion.img
              src={listing.image}
              alt={`${listing.title} — ${listing.city}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "size-full object-cover transition-all duration-700",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              animate={{ scale: isHovered ? 1.06 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Gradient Overlay - more sophisticated */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge
                  variant={listing.deal === "ijara" ? "accent" : "default"}
                  className="border-0 px-3 py-1 font-semibold shadow-lg backdrop-blur-md"
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
                  <Badge variant="gold" className="gap-1 border-0 px-3 py-1 font-semibold shadow-lg backdrop-blur-md">
                    <Sparkles className="size-3" />
                    Premium
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="absolute right-3 top-3 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300",
                    isLiked
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-white/95 text-muted-foreground shadow-lg hover:text-red-500"
                  )}
                  aria-label={t.favorites.addToFavorites}
                >
                  <Heart className={cn("size-5 transition-transform", isLiked && "scale-110 fill-current")} />
                </motion.button>

                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="flex size-10 items-center justify-center rounded-full bg-white/95 text-muted-foreground shadow-lg backdrop-blur-md hover:text-primary"
                      aria-label="Share"
                    >
                      <Share2 className="size-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bottom Price & Location - on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <motion.p
                    animate={{ y: isHovered ? -2 : 0 }}
                    className="font-display text-2xl font-extrabold text-white drop-shadow-lg md:text-[1.75rem]"
                  >
                    {priceDisplay}
                  </motion.p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                    <MapPin className="size-3.5" />
                    <span className="line-clamp-1">{listing.district}, {listing.city}</span>
                  </p>
                </div>

                {/* Rating pill */}
                <div className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur-sm">
                  <Star className="size-3.5 fill-gold text-gold" />
                  <span className="text-sm font-semibold text-white">{listing.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 p-4 md:p-5">
            {/* Title */}
            <h3 className="line-clamp-1 font-display text-base font-bold transition-colors group-hover:text-primary md:text-lg">
              {listing.title}
            </h3>

            {/* Features - cleaner tags */}
            <div className="flex flex-wrap items-center gap-2">
              {listing.rooms > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-medium">
                  <BedDouble className="size-3.5 text-primary" />
                  <span>{listing.rooms} xona</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-medium">
                <Ruler className="size-3.5 text-primary" />
                <span>{listing.area} m²</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-medium">
                <Building2 className="size-3.5 text-primary" />
                <span>{typeLabel}</span>
              </div>
            </div>

            {/* View Details - appears on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="pt-1"
                >
                  <div className="flex items-center justify-between rounded-xl bg-primary/8 px-4 py-2.5">
                    <span className="text-sm font-semibold text-primary">Batafsil ko'rish</span>
                    <ArrowUpRight className="size-4 text-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

// Horizontal Card Variant
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
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className={cn(
              "absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full backdrop-blur-md transition-colors",
              isLiked ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground"
            )}
          >
            <Heart className={cn("size-3.5", isLiked && "fill-current")} />
          </motion.button>
        </div>

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="font-display text-lg font-bold text-primary">{priceDisplay}</p>
            <h3 className="mt-1 line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
              {listing.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {listing.district}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5 text-primary" /> {listing.rooms}
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="size-3.5 text-primary" /> {listing.area}m²
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

// Compact Card Variant
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
        className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-all hover:border-primary/30 hover:bg-secondary/50"
      >
        <div className="size-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={listing.image}
            alt={listing.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {listing.title}
          </p>
          <p className="text-xs text-muted-foreground">{listing.district}</p>
        </div>
        <p className="font-display text-sm font-bold text-primary">{priceDisplay}</p>
      </Link>
    </motion.div>
  );
}

// Featured Property Card - Large display
export function FeaturedPropertyCard({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const priceDisplay = formatListingPrice(listing.price, listing.deal, currency, format);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Link
        to="/elonlar/$id"
        params={{ id: listing.id }}
        className="relative block overflow-hidden rounded-2xl md:rounded-3xl"
      >
        {/* Image */}
        <div className="aspect-[21/10] overflow-hidden md:aspect-[21/9]">
          <motion.img
            src={listing.image}
            alt={listing.title}
            className="size-full object-cover"
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Gradient Overlay - cinematic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white md:p-8 lg:p-10">
          {/* Badges */}
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="gold" className="gap-1.5 border-0 px-3 py-1.5 font-semibold shadow-lg backdrop-blur-md">
              <Sparkles className="size-3.5" />
              Premium
            </Badge>
            <Badge
              variant={listing.deal === "ijara" ? "accent" : "default"}
              className="border-0 px-3 py-1.5 font-semibold shadow-lg backdrop-blur-md"
            >
              {listing.deal === "ijara" ? t.deal.forRent : t.deal.sale}
            </Badge>
          </div>

          {/* Title & Location */}
          <motion.h3
            animate={{ y: isHovered ? -4 : 0 }}
            className="font-display text-2xl font-bold md:text-3xl lg:text-4xl"
          >
            {listing.title}
          </motion.h3>

          <p className="mt-2 flex items-center gap-1.5 text-white/80">
            <MapPin className="size-4" />
            {listing.district}, {listing.city}
          </p>

          {/* Price & Features */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <motion.p
              animate={{ scale: isHovered ? 1.02 : 1 }}
              className="font-display text-3xl font-extrabold md:text-4xl"
            >
              {priceDisplay}
            </motion.p>

            <div className="flex items-center gap-2 md:gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur-sm md:px-4">
                <BedDouble className="size-4" /> {listing.rooms} xona
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur-sm md:px-4">
                <Ruler className="size-4" /> {listing.area}m²
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur-sm sm:flex md:px-4">
                <Star className="size-4 fill-gold text-gold" /> {listing.rating}
              </span>
            </div>
          </div>

          {/* View Details - appears on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6"
              >
                <Button
                  variant="glass"
                  size="lg"
                  className="gap-2 rounded-full border-white/20 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
                >
                  Batafsil ko'rish
                  <ArrowUpRight className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "absolute right-4 top-4 flex size-12 items-center justify-center rounded-full backdrop-blur-md transition-all md:right-6 md:top-6",
            isLiked
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          <Heart className={cn("size-6", isLiked && "fill-current")} />
        </motion.button>
      </Link>
    </motion.div>
  );
}
