import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

const latestShoes: Product[] = [
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Aero Force 1 '07",
    brand: "Aero",
    price: "110.00",
    image: "/shoes/shoe-3.webp",
    category: "Lifestyle",
    description: "The radiance lives on in the Aero Force 1 '07, a low-cut classic with durable leather and cushioned Air.",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Air Jordan 1 Retro High OG",
    brand: "Aero",
    price: "180.00",
    image: "/shoes/shoe-2.webp",
    category: "Basketball",
    description: "The shoe that started it all. Premium leather construction with iconic colorways.",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Aero Dunk Low Retro",
    brand: "Aero",
    price: "110.00",
    image: "/shoes/shoe-4.webp",
    category: "Lifestyle",
    description: "Created for the hardwood but taken to the streets. Classic details and a low-cut silhouette.",
  },
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Aero Air Max 270",
    brand: "Aero",
    price: "150.00",
    image: "/shoes/shoe-1.jpg",
    category: "Sneakers",
    description: "The Aero Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper.",
  },
];

const trendingShoes: Product[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    name: "Aero ZoomX Vaporfly NEXT% 2",
    brand: "Aero",
    price: "250.00",
    image: "/shoes/shoe-10.avif",
    category: "Running",
    description: "Race-day performance at its peak. ZoomX foam and a carbon fiber plate propel you forward.",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    name: "Air Jordan 4 Retro",
    brand: "Aero",
    price: "210.00",
    image: "/shoes/shoe-11.avif",
    category: "Basketball",
    description: "Visible Air cushioning and iconic mesh panels. One of the most coveted silhouettes ever.",
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    name: "Aero Air Max 97",
    brand: "Aero",
    price: "175.00",
    image: "/shoes/shoe-13.avif",
    category: "Sneakers",
    description: "Inspired by Japanese bullet trains. Full-length Air cushioning and a sleek futuristic silhouette.",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Aero Blazer Mid '77",
    brand: "Aero",
    price: "100.00",
    image: "/shoes/shoe-9.avif",
    category: "Lifestyle",
    description: "Vintage basketball style meets everyday wear. Classic leather upper with retro Aero branding.",
  },
];

const categories = [
  { label: "Men", href: "/products?gender=men", image: "/shoes/shoe-5.avif" },
  { label: "Women", href: "/products?gender=women", image: "/shoes/shoe-8.avif" },
  { label: "Running", href: "/products?category=running", image: "/shoes/shoe-6.avif" },
  { label: "Basketball", href: "/products?category=basketball", image: "/shoes/shoe-11.avif" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-200)]">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[var(--color-dark-900)] overflow-hidden min-h-[560px] flex items-center">
        <div className="absolute inset-0">
          <Image src="/hero-bg.png" alt="" fill className="object-cover opacity-20" priority />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-8 items-center py-16">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-dark-500)] mb-4">
              New Season Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-light-100)] leading-tight mb-6">
              Move Fast.<br />Go Further.
            </h1>
            <p className="text-lg text-[var(--color-dark-500)] mb-8 max-w-md leading-relaxed">
              Explore the latest Aero drops — engineered for performance, built for the streets.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[var(--color-light-100)] text-[var(--color-dark-900)] font-semibold px-8 py-3 rounded hover:bg-[var(--color-light-300)] transition-colors"
            >
              Shop Now
            </Link>
          </div>
          <div className="relative h-72 md:h-96">
            <Image
              src="/hero-shoe.png"
              alt="Featured Aero shoe"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="max-w-7xl w-full mx-auto px-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark-900)] mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-light-300)]"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Drops */}
      <section id="latest" className="max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark-900)]">Latest Drops</h2>
          <Link href="/products" className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)] underline underline-offset-4 hover:text-[var(--color-dark-700)] transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestShoes.map((shoe, i) => (
            <Card key={shoe.id} product={shoe} badge={i === 0 ? "Best Seller" : undefined} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl w-full mx-auto px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark-900)]">Trending Now</h2>
          <Link href="/products?sort=newest" className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)] underline underline-offset-4 hover:text-[var(--color-dark-700)] transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingShoes.map((shoe, i) => (
            <Card key={shoe.id} product={shoe} badge={i === 1 ? "Extra 20% off" : undefined} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
