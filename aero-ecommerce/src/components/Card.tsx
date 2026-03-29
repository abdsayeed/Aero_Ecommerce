"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/db/schema";

interface CardProps {
  product: Product;
  badge?: string;
}

export default function Card({ product, badge }: CardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      className="group flex flex-col overflow-hidden font-[var(--font-jost)] cursor-pointer rounded-2xl"
      onClick={handleAddToCart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleAddToCart()}
      aria-label={`${product.name} — $${parseFloat(product.price).toFixed(2)}`}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-[var(--color-light-200)] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
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

      {/* Info bar — pure black, flush bottom */}
      <div className="bg-[var(--color-dark-900)] px-4 pt-4 pb-5 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] flex-1 leading-snug">
            {product.name}
          </h3>
          <span className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] whitespace-nowrap">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        <p className="text-[length:var(--text-caption)] text-[var(--color-dark-500)] mt-1">
          {product.category}
        </p>
        <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
          {product.brand}
        </p>
      </div>
    </article>
  );
}
