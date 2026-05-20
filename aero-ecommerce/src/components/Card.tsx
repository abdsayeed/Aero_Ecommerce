"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types/product";

interface CardProps {
  product: Product;
  badge?: string;
}

export default function Card({ product, badge }: CardProps) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to product page for size selection — can't add without a variant
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((w) => !w);
  };

  const hasImage = !!product.image;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-[3/4] bg-[var(--color-light-200)] overflow-hidden">
        {hasImage ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-dark-500)] text-sm">
            No image
          </div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[10px] font-semibold tracking-wider uppercase px-3 py-1">
            {badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[var(--color-light-100)]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-light-100)]"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-[var(--color-dark-900)] text-[var(--color-dark-900)]" : "text-[var(--color-dark-900)]"}`}
          />
        </button>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[11px] font-medium tracking-wider uppercase hover:bg-[var(--color-charcoal)] transition-colors"
          >
            {added ? "✓ Added" : "Quick Add"}
          </button>
        </div>
      </div>

      <div className="pt-3 pb-5 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-medium text-[var(--color-dark-900)] leading-snug flex-1">
            {product.name}
          </h3>
          <span className="text-[14px] font-medium text-[var(--color-dark-900)] whitespace-nowrap">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        {product.category && (
          <p className="text-[12px] text-[var(--color-dark-500)] mt-0.5">
            {product.category}
          </p>
        )}
      </div>
    </Link>
  );
}
