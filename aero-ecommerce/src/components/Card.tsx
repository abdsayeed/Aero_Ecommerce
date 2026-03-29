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
    <article className="group flex flex-col bg-[var(--color-light-200)] rounded-lg overflow-hidden font-[var(--font-jost)] cursor-pointer">
      {/* Image area */}
      <div className="relative aspect-square bg-[var(--color-light-200)] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-[var(--color-light-100)] text-[var(--color-red)] text-[length:var(--text-caption)] font-semibold px-3 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Info bar */}
      <div className="bg-[var(--color-dark-900)] px-4 py-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[length:var(--text-body-medium)] leading-[var(--text-body-medium--line-height)] font-medium text-[var(--color-light-100)] flex-1">
            {product.name}
          </h3>
          <span className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] whitespace-nowrap">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>
        <p className="text-[length:var(--text-caption)] text-[var(--color-dark-500)]">
          {product.category}
        </p>
        <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
          {product.description.split(" ").slice(0, 6).join(" ")}…
        </p>

        <button
          onClick={handleAddToCart}
          className={`mt-3 w-full py-2 rounded text-[length:var(--text-caption)] font-semibold transition-all duration-200 ${
            added
              ? "bg-[var(--color-green)] text-[var(--color-light-100)] scale-95"
              : "bg-[var(--color-light-100)] text-[var(--color-dark-900)] hover:bg-[var(--color-light-300)]"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
