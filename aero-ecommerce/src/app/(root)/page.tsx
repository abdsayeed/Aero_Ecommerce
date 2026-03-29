import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Image from "next/image";

export const dynamic = "force-dynamic";

type StaticProduct = {
  id: number;
  name: string;
  brand: string;
  price: string;
  image: string;
  category: string;
  description: string;
};

const latestShoes: StaticProduct[] = [
  {
    id: 101,
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    price: "110.00",
    image: "/shoes/shoe-1.jpg",
    category: "Lifestyle",
    description: "The radiance lives on in the Nike Air Force 1 '07, a low-cut classic with durable leather and cushioned Air.",
  },
  {
    id: 102,
    name: "Air Jordan 1 Retro High OG",
    brand: "Nike",
    price: "180.00",
    image: "/shoes/shoe-2.webp",
    category: "Basketball",
    description: "The shoe that started it all. The Air Jordan 1 Retro High OG is a timeless icon with premium leather construction.",
  },
  {
    id: 103,
    name: "Nike Dunk Low Retro",
    brand: "Nike",
    price: "110.00",
    image: "/shoes/shoe-3.webp",
    category: "Lifestyle",
    description: "Created for the hardwood but taken to the streets, the Nike Dunk Low Retro returns with classic details.",
  },
  {
    id: 104,
    name: "Nike Air Max 270",
    brand: "Nike",
    price: "150.00",
    image: "/shoes/shoe-4.webp",
    category: "Sneakers",
    description: "The Nike Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper.",
  },
];

async function getProducts(): Promise<StaticProduct[]> {
  try {
    const { db } = await import("@/lib/db");
    const { products } = await import("@/lib/db/schema");
    if (!db) return [];
    const rows = await db.select().from(products);
    return rows.map((p) => ({
      id: 0,
      name: p.name,
      brand: "",
      price: "0.00",
      image: "",
      category: "",
      description: p.description,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const dbProducts = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-200)]">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[var(--color-dark-900)] overflow-hidden min-h-[560px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-8 items-center py-16">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-dark-500)] mb-4">
              New Season Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-light-100)] leading-tight mb-6">
              Just Do It
            </h1>
            <p className="text-lg text-[var(--color-dark-500)] mb-8 max-w-md leading-relaxed">
              Explore the latest drops — engineered for performance, built for the streets.
            </p>
            <a
              href="#latest"
              className="inline-block bg-[var(--color-light-100)] text-[var(--color-dark-900)] font-semibold px-8 py-3 rounded hover:bg-[var(--color-light-300)] transition-colors"
            >
              Shop Now
            </a>
          </div>

          <div className="relative h-72 md:h-96">
            <Image
              src="/hero-shoe.png"
              alt="Featured shoe"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Latest Shoes — static placeholder */}
      <section id="latest" className="max-w-7xl w-full mx-auto px-6 py-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-dark-900)] mb-10">
          Latest Shoes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestShoes.map((shoe, i) => (
            <Card
              key={shoe.id}
              product={shoe}
              badge={i === 0 ? "Best Seller" : undefined}
            />
          ))}
        </div>
      </section>

      {/* All Products — from DB */}
      {dbProducts.length > 0 && (
        <section className="max-w-7xl w-full mx-auto px-6 pb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-dark-900)] mb-10">
            All Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
