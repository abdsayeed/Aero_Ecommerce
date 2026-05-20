"use client";

import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  Shield,
  Heart,
} from "lucide-react";

/* Inline Instagram icon (not available in this lucide version) */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* ── Animation variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Categories ── */
const categories = [
  {
    label: "Oversized Tees",
    href: "/products?category=tees",
    image: "/collection-tee.png",
  },
  {
    label: "Hoodies",
    href: "/products?category=hoodies",
    image: "/collection-hoodie.png",
  },
  {
    label: "Sweatshirts",
    href: "/products?category=sweatshirts",
    image: "/collection-sweatshirt.png",
  },
  {
    label: "Tracksuits",
    href: "/products?category=tracksuits",
    image: "/collection-tracksuit.png",
  },
];

/* ── Why Aervyn ── */
const whyCards = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Premium Quality",
    description:
      "Crafted from heavyweight 300 GSM cotton and luxury fabrics that feel as good as they look.",
  },
  {
    icon: <Shirt className="w-6 h-6" />,
    title: "Minimal Design",
    description:
      "Clean silhouettes, no excess. Every piece is designed to be timeless and versatile.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Everyday Comfort",
    description:
      "Relaxed fits engineered for all-day wear. From studio to street, we've got you covered.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Modern Streetwear",
    description:
      "Inspired by the culture. Designed for those who dare to stand out and set the tone.",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax on hero
    const handler = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />

      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[100vh] flex items-center bg-[var(--color-dark-900)]">
        {/* Background Image with Parallax */}
        <div ref={heroRef} className="absolute inset-0 w-full h-[120%]">
          <Image
            src="/hero-streetwear.png"
            alt="Aervyn streetwear model"
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark-900)] via-transparent to-[var(--color-dark-900)]/40" />
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 pb-24"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-beige)] mb-6"
          >
            New Season — SS26
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl lg:text-[120px] font-semibold text-[var(--color-light-100)] leading-[0.9] tracking-[-0.04em] mb-8"
          >
            Stand
            <br />
            Out<span className="text-[var(--color-beige)]">.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-[var(--color-dark-500)] mb-10 max-w-md leading-relaxed"
          >
            Premium minimalist streetwear for the modern man. Oversized fits,
            luxe fabrics, timeless designs.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-[var(--color-light-100)] text-[var(--color-dark-900)] font-medium text-sm tracking-wide uppercase px-8 py-4 hover:bg-[var(--color-beige)] transition-all duration-300"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-[var(--color-light-100)]/30 text-[var(--color-light-100)] font-medium text-sm tracking-wide uppercase px-8 py-4 hover:bg-[var(--color-light-100)]/10 transition-all duration-300"
            >
              Explore Collection
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-dark-500)]">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[var(--color-dark-500)] to-transparent" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          2. FEATURED COLLECTIONS
      ═══════════════════════════════════════════ */}
      <section className="max-w-7xl w-full mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-dark-500)] mb-3 block">
                Collections
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-dark-900)] tracking-tight">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 text-[13px] font-medium tracking-wide uppercase text-[var(--color-dark-900)] hover:opacity-60 transition-opacity"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.label} variants={fadeInUp}>
                <Link
                  href={cat.href}
                  className="group relative aspect-[3/4] block overflow-hidden bg-[var(--color-light-200)]"
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-[var(--color-light-100)] text-sm font-medium tracking-wide">
                      {cat.label}
                    </span>
                    <div className="mt-2 flex items-center gap-1.5 text-[var(--color-light-100)]/70 text-[11px] font-medium tracking-wider uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Shop Now
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          3. BEST SELLERS / FEATURED PRODUCTS
      ═══════════════════════════════════════════ */}
      <section className="bg-[var(--color-light-200)] py-20">
        <div className="max-w-7xl w-full mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-dark-500)] mb-3 block">
                  Best Sellers
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-dark-900)] tracking-tight">
                  Most Wanted
                </h2>
              </div>
              <Link
                href="/products?sort=best"
                className="hidden md:inline-flex items-center gap-2 text-[13px] font-medium tracking-wide uppercase text-[var(--color-dark-900)] hover:opacity-60 transition-opacity"
              >
                Shop All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  name: "Essential Oversized Tee",
                  price: "£45.00",
                  category: "Oversized Tees",
                  image: "/collection-tee.png",
                },
                {
                  name: "Heavyweight Hoodie",
                  price: "£85.00",
                  category: "Hoodies",
                  image: "/collection-hoodie.png",
                },
                {
                  name: "Core Crewneck",
                  price: "£65.00",
                  category: "Sweatshirts",
                  image: "/collection-sweatshirt.png",
                },
                {
                  name: "Track Set — Full",
                  price: "£120.00",
                  category: "Tracksuits",
                  image: "/collection-tracksuit.png",
                },
              ].map((product, i) => (
                <motion.div key={product.name} variants={fadeInUp}>
                  <Link
                    href="/products"
                    className="group block bg-[var(--color-light-100)]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-light-200)]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      {/* Quick add overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="w-full py-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[12px] font-medium tracking-wider uppercase hover:bg-[var(--color-charcoal)] transition-colors">
                          Quick Add
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-3 left-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[10px] font-semibold tracking-wider uppercase px-3 py-1">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[14px] font-medium text-[var(--color-dark-900)] mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[12px] text-[var(--color-dark-500)] mb-2">
                        {product.category}
                      </p>
                      <span className="text-[14px] font-medium text-[var(--color-dark-900)]">
                        {product.price}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. WHY AERVYN
      ═══════════════════════════════════════════ */}
      <section className="py-20 bg-[var(--color-dark-900)]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-beige)] mb-3 block">
                The Aervyn Difference
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-light-100)] tracking-tight">
                Why Aervyn
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeInUp}
                  className="group text-center p-8 border border-[var(--color-charcoal)] hover:border-[var(--color-beige)]/30 transition-colors duration-500"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-[var(--color-beige)]">
                    {card.icon}
                  </div>
                  <h3 className="text-[15px] font-medium text-[var(--color-light-100)] mb-3 tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-[var(--color-dark-500)] leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. INSTAGRAM / SOCIAL GALLERY
      ═══════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-[var(--color-dark-900)] mb-4">
                <InstagramIcon className="w-5 h-5" />
                <span className="text-[13px] font-medium tracking-wide">
                  @wearaervyn
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-dark-900)] tracking-tight">
                Wear the Culture
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "/collection-tee.png",
                "/hero-streetwear.png",
                "/collection-hoodie.png",
                "/instagram-lifestyle.png",
              ].map((src, i) => (
                <motion.a
                  key={i}
                  href="https://instagram.com/wearaervyn"
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeInUp}
                  className="group relative aspect-square overflow-hidden bg-[var(--color-light-200)]"
                >
                  <Image
                    src={src}
                    alt={`Aervyn lifestyle ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <InstagramIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. NEWSLETTER
      ═══════════════════════════════════════════ */}
      <section className="bg-[var(--color-beige-light)] py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <motion.span
              variants={fadeInUp}
              className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-dark-500)] mb-3 block"
            >
              Stay Connected
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-semibold text-[var(--color-dark-900)] tracking-tight mb-4"
            >
              Join the Aervyn Community
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-[14px] text-[var(--color-dark-700)] mb-8 leading-relaxed"
            >
              Be the first to know about new drops, exclusive offers, and
              behind-the-scenes content.
            </motion.p>
            <motion.form
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 border border-[var(--color-dark-900)]/15 bg-[var(--color-light-100)] text-[14px] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[13px] font-medium tracking-wider uppercase hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Subscribe
              </button>
            </motion.form>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-[11px] text-[var(--color-dark-500)]"
            >
              No spam. Unsubscribe anytime.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
