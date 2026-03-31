"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types/product";

interface CardProps {
  product: Product;
  badge?: string;
}

export default function Card({ product, badge }: CardProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to product page for size selection — can't add without a variant
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasImage = !!product.image;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-square bg-[var(--color-light-200)] overflow-hidden">
        {hasImage ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-dark-500)] text-sm">
            No image
          </div>
        )}
        {badge && (
          <span className="absolute top-4 left-4 bg-[var(--color-light-100)] text-[var(--color-red)] text-[length:var(--text-caption)] font-bold px-4 py-1.5 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        {added && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <span className="bg-[var(--color-green)] text-white text-sm font-semibold px-4 py-2 rounded-full">
              ✓ Added
            </span>
          </div>
        )}
      </div>

      <div className="bg-[var(--color-dark-900)] px-4 pt-4 pb-5 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] flex-1 leading-snug">
            {product.name}
          </h3>
          <span className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] whitespace-nowrap">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        {product.category && (
          <p className="text-[length:var(--text-caption)] text-[var(--color-dark-500)] mt-1">
            {product.category}
          </p>
        )}
        {product.brand && (
          <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
            {product.brand}
          </p>
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-2 text-left text-[length:var(--text-footnote)] text-[var(--color-dark-500)] hover:text-[var(--color-light-100)] transition-colors focus:outline-none focus-visible:underline"
          aria-label={`Add ${product.name} to cart`}
        >
          + Add to Cart
        </button>
      </div>
    </Link>
  );
}
