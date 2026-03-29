import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import { Product } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    if (!db) return [];
    return await db.select().from(products);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-12 h-8 text-white fill-current"
              viewBox="0 0 100 42"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.333 41.895L99.333 9.562c1.333-.5 1.667-1.5.667-2.167-1-.666-3-.5-4.333 0L9.667 35.895l-4-6.666c-.667-1.167-2.333-1.5-3.333-.5s-1 2.833-.333 4l3.333 9.166z" />
            </svg>
            <span className="text-white font-black text-xl tracking-tight">
              Aero Store
            </span>
          </div>
          <CartButton />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block bg-white/10 text-white/70 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
          New Season Collection
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-4">
          Just Do It
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Explore the latest Nike drops — engineered for performance, built for the streets.
        </p>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {allProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">
              No products found. Fill in your{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-white">
                DATABASE_URL
              </code>{" "}
              in{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-white">
                .env.local
              </code>{" "}
              and run{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-white">
                npx drizzle-kit push
              </code>{" "}
              then{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-white">
                npm run db:seed
              </code>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm font-medium mb-6">
              {allProducts.length} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Aero Store · Powered by Next.js, Drizzle & Neon
      </footer>
    </div>
  );
}
