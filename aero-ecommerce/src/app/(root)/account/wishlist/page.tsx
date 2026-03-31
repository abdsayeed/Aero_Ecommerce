import { Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getWishlist } from "@/lib/actions/wishlist";

export default async function WishlistPage() {
  const result = await getWishlist();

  if ("error" in result) {
    return <p className="text-[var(--color-red)]">{result.error}</p>;
  }

  const { data: products } = result;

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <Heart className="w-12 h-12 text-[var(--color-light-300)]" />
        <h2 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">No saved items</h2>
        <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)]">Items you favourite will appear here.</p>
        <Link href="/products" className="mt-2 px-6 py-2.5 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">
        Wishlist ({products.length})
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
