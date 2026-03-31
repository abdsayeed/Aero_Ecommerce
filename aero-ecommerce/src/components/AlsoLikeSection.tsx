import Image from "next/image";
import Link from "next/link";
import { getRecommendedProducts } from "@/lib/actions/products";
import type { RecommendedProduct } from "@/lib/actions/products";

// ─── Single recommended card ──────────────────────────────────────────────────

function RecommendedCard({ product }: { product: RecommendedProduct }) {
  const price = parseFloat(product.price);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-[var(--color-light-100)]"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-square bg-[var(--color-light-200)] overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-dark-500)] text-xs">
            No image
          </div>
        )}
      </div>

      <div className="pt-2 pb-4 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] leading-snug flex-1">
            {product.name}
          </h3>
          <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] whitespace-nowrap shrink-0">
            {salePrice ? (
              <span className="text-[var(--color-red)]">${salePrice.toFixed(2)}</span>
            ) : (
              `$${price.toFixed(2)}`
            )}
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

// ─── Main export ──────────────────────────────────────────────────────────────

export default async function AlsoLikeSection({ productId }: { productId: string }) {
  const recommended = await getRecommendedProducts(productId);

  if (recommended.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)] mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {recommended.map((p) => (
          <RecommendedCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
