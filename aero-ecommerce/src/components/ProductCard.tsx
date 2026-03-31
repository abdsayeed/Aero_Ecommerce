import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/actions/products";

interface ProductCardProps {
  product: ProductListItem;
  badge?: string;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const price = parseFloat(product.minPrice);
  const maxPrice = parseFloat(product.maxPrice);
  const hasRange = maxPrice > price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-[var(--color-light-100)]"
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--color-light-200)] overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-dark-500)] text-xs">
            No image
          </div>
        )}
        {(badge || product.hasSale) && (
          <span className={`absolute top-3 left-3 text-[length:var(--text-footnote)] font-semibold ${badge ? "text-[var(--color-red)]" : "text-[var(--color-green)]"}`}>
            {badge ?? "Sale"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 pb-4 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] leading-snug flex-1">
            {product.name}
          </h3>
          <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] whitespace-nowrap shrink-0">
            {hasRange ? `$${price.toFixed(2)} – $${maxPrice.toFixed(2)}` : `$${price.toFixed(2)}`}
          </span>
        </div>
        <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
          {product.gender.label}&apos;s {product.category.name}
        </p>
        <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
          {product.colorCount} Colour{product.colorCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
