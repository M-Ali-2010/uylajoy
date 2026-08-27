"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2, Grid3X3 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageGallery({ images, alt = "Property image", className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsGridView(false);
  };

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, goToPrevious, goToNext]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("grid gap-2", className)}>
        {images.length === 1 ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-2xl"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0]}
              alt={alt}
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity hover:opacity-100">
              <Button variant="glass" size="icon-sm">
                <ZoomIn className="size-4" />
              </Button>
            </div>
          </motion.div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-2">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative col-span-2 row-span-2 cursor-zoom-in overflow-hidden rounded-l-2xl"
              onClick={() => openLightbox(0)}
            >
              <img
                src={images[0]}
                alt={`${alt} 1`}
                className="size-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
            {images.slice(1, 5).map((image, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative cursor-zoom-in overflow-hidden",
                  index === 1 && "rounded-tr-2xl",
                  index === 3 && "rounded-br-2xl"
                )}
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image}
                  alt={`${alt} ${index + 2}`}
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <span className="font-display text-2xl font-bold">+{images.length - 5}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* View all button */}
        {images.length > 1 && (
          <Button
            variant="outline"
            className="absolute bottom-4 right-4"
            onClick={() => {
              setIsGridView(true);
              setIsLightboxOpen(true);
            }}
          >
            <Grid3X3 className="mr-2 size-4" />
            Barcha rasmlar ({images.length})
          </Button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-white hover:bg-white/10"
              onClick={closeLightbox}
            >
              <X className="size-6" />
            </Button>

            {/* Action buttons */}
            <div className="absolute right-4 top-16 z-50 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGridView(!isGridView);
                }}
              >
                <Grid3X3 className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  // Download logic
                }}
              >
                <Download className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  const imageUrl = images[selectedIndex];
                  if (navigator.share && imageUrl) {
                    navigator.share({ url: imageUrl });
                  }
                }}
              >
                <Share2 className="size-5" />
              </Button>
            </div>

            {isGridView ? (
              // Grid view
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid max-h-[90vh] max-w-6xl grid-cols-3 gap-4 overflow-y-auto p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => {
                      setSelectedIndex(index);
                      setIsGridView(false);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${alt} ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Single image view
              <>
                {/* Navigation buttons */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="absolute left-4 z-50 text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                      }}
                    >
                      <ChevronLeft className="size-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="absolute right-4 z-50 text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                    >
                      <ChevronRight className="size-8" />
                    </Button>
                  </>
                )}

                {/* Image */}
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative max-h-[85vh] max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={images[selectedIndex]}
                    alt={`${alt} ${selectedIndex + 1}`}
                    className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                  />
                </motion.div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl bg-black/50 p-2 backdrop-blur-sm">
                    {images.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "size-12 overflow-hidden rounded-lg transition-all",
                          selectedIndex === index
                            ? "ring-2 ring-white"
                            : "opacity-60 hover:opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(index);
                        }}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="size-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple image with zoom on hover
export function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      onHoverStart={() => setIsZoomed(true)}
      onHoverEnd={() => setIsZoomed(false)}
    >
      <motion.img
        src={src}
        alt={alt}
        className="size-full object-cover"
        animate={{ scale: isZoomed ? 1.1 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}
