"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GalleryColor = {
  id: string;
  name: string;
  slug: string;
  hexCode: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  variantId: string | null;
};

interface ProductGalleryDBProps {
  productName: string;
  images: GalleryImage[];
  colors: GalleryColor[];
  /** colorId → variantId[] */
  variantsByColor: Record<string, string[]>;
}

export default function ProductGalleryDB({
  productName,
  images,
  colors,
  variantsByColor,
}: ProductGalleryDBProps) {
  const [activeColorId, setActiveColorId] = useState<string>(colors[0]?.id ?? "");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Images for the active color — match by variantId belonging to this color's variants
  const variantIds = new Set(variantsByColor[activeColorId] ?? []);
  const colorImages = images.filter(
    (img) => img.variantId !== null && variantIds.has(img.variantId)
  );
  // Fallback: if no images matched (e.g. color slug mismatch), show all images
  const displayImages = colorImages.length > 0 ? colorImages : images;

  // Primary image per color swatch — first image whose variantId is in that color's set
  const colorPrimaryImage = (colorId: string): string | null => {
    const ids = new Set(variantsByColor[colorId] ?? []);
    return (
      images.find((i) => i.variantId !== null && ids.has(i.variantId) && i.isPrimary)?.url ??
      images.find((i) => i.variantId !== null && ids.has(i.variantId))?.url ??
      null
    );
  };

  useEffect(() => {
    setActiveImageIdx(0);
  }, [activeColorId]);

  const prev = useCallback(() => {
    setActiveImageIdx((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  }, [displayImages.length]);

  const next = useCallback(() => {
    setActiveImageIdx((i) => (i === displayImages.length - 1 ? 0 : i + 1));
  }, [displayImages.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [prev, next]
  );

  const currentImage = displayImages[activeImageIdx] ?? null;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Gallery: thumbnails left + main image ── */}
      <div className="flex flex-col-reverse md:flex-row gap-3 w-full">

        {/* Thumbnail strip — vertical on desktop, horizontal scroll on mobile */}
        {displayImages.length > 0 && (
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[540px] shrink-0 pb-1 md:pb-0">
            {displayImages.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImageIdx(i)}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === activeImageIdx}
                className={`relative w-[72px] h-[72px] shrink-0 border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] bg-[var(--color-light-200)] ${
                  i === activeImageIdx
                    ? "border-[var(--color-dark-900)]"
                    : "border-transparent hover:border-[var(--color-dark-500)]"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} view ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          className="relative flex-1 aspect-square bg-[var(--color-light-200)] overflow-hidden focus:outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`${productName} — use arrow keys to navigate`}
        >
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={`${productName}`}
              fill
              className="object-contain p-8"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-dark-500)]">
              <ImageOff className="w-10 h-10" />
              <span className="text-[length:var(--text-caption)]">No image available</span>
            </div>
          )}

          {/* Prev / Next */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[var(--color-light-100)]/80 hover:bg-[var(--color-light-100)] border border-[var(--color-light-300)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)]"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--color-dark-900)]" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[var(--color-light-100)]/80 hover:bg-[var(--color-light-100)] border border-[var(--color-light-300)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)]"
              >
                <ChevronRight className="w-4 h-4 text-[var(--color-dark-900)]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Color swatches — image thumbnails like the reference ── */}
      {colors.length > 1 && (
        <div>
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Select colour">
            {colors.map((color) => {
              const isActive = color.id === activeColorId;
              const swatchImg = colorPrimaryImage(color.id);

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setActiveColorId(color.id)}
                  aria-pressed={isActive}
                  aria-label={`Select colour: ${color.name}`}
                  className={`relative w-[52px] h-[52px] shrink-0 border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-dark-900)] bg-[var(--color-light-200)] ${
                    isActive
                      ? "border-[var(--color-dark-900)]"
                      : "border-[var(--color-light-300)] hover:border-[var(--color-dark-500)]"
                  }`}
                >
                  {swatchImg ? (
                    <Image
                      src={swatchImg}
                      alt={color.name}
                      fill
                      className="object-contain p-1"
                      sizes="52px"
                    />
                  ) : (
                    <span
                      className="absolute inset-2 rounded-full"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
            {colors.find((c) => c.id === activeColorId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
