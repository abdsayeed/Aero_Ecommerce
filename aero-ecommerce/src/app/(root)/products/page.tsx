import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import ProductCard from "@/components/ProductCard";
import { parseFilterParams } from "@/lib/utils/query";
import { getAllProducts } from "@/lib/actions/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// ─── Pagination component ─────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  searchString,
}: {
  page: number;
  totalPages: number;
  searchString: string;
}) {
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchString);
    params.set("page", String(p));
    return `/products?${params.toString()}`;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link
          href={makeHref(page - 1)}
          className="px-4 py-2 text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] border border-[var(--color-light-300)] hover:bg-[var(--color-light-200)] transition-colors"
        >
          ← Prev
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[var(--color-dark-500)]">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={makeHref(p as number)}
              className={`px-4 py-2 text-[length:var(--text-caption)] font-medium transition-colors ${
                p === page
                  ? "bg-[var(--color-dark-900)] text-[var(--color-light-100)]"
                  : "text-[var(--color-dark-900)] border border-[var(--color-light-300)] hover:bg-[var(--color-light-200)]"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          )
        )}

      {page < totalPages && (
        <Link
          href={makeHref(page + 1)}
          className="px-4 py-2 text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] border border-[var(--color-light-300)] hover:bg-[var(--color-light-200)] transition-colors"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = parseFilterParams(params);

  const result = await getAllProducts(filters);
  const { products: productList, totalCount, totalPages } = result;

  // Build search string for pagination links
  const searchString = Object.entries(params)
    .filter(([, v]) => !!v)
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(",") : v}`)
    .join("&");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)]">
            {filters.search
              ? `Results for "${filters.search}" (${totalCount})`
              : `New (${totalCount})`}
          </h1>
          <Suspense fallback={null}>
            <Sort />
          </Suspense>
        </div>

        {/* Mobile filter trigger */}
        <div className="flex items-center gap-3 mb-4 lg:hidden">
          <Suspense fallback={null}>
            <Filters totalCount={totalCount} mobileOnly />
          </Suspense>
        </div>

        {/* Sidebar + grid */}
        <div className="flex gap-8 items-start">
          <Suspense fallback={null}>
            <Filters totalCount={totalCount} desktopOnly />
          </Suspense>

          <div className="flex-1 min-w-0">
            {productList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-[length:var(--text-heading-3)] font-medium text-[var(--color-dark-900)] mb-2">
                  No products found
                </p>
                <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)] mb-6">
                  {filters.search
                    ? `We couldn't find anything for "${filters.search}". Try a different term.`
                    : "Try adjusting your filters or clearing them."}
                </p>
                <Link
                  href="/products"
                  className="px-6 py-2.5 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors"
                >
                  {filters.search ? "Clear Search" : "Clear Filters"}
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                  {productList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  searchString={searchString}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
