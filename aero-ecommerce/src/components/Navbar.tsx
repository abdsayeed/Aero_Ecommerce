"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Menu, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=kids" },
  { label: "Collections", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((state) => state.totalItems);

  useEffect(() => { setMounted(true); }, []);
  const count = mounted ? totalItems() : 0;

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <nav className="w-full bg-[var(--color-light-100)] border-b border-[var(--color-light-300)] font-[var(--font-jost)] relative z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" aria-label="Aero Store Home" className="flex-shrink-0">
            <Image
              src="/IMG_7194.PNG"
              alt="Aero"
              width={80}
              height={52}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="flex items-center gap-1.5 text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors whitespace-nowrap"
              aria-label={`Cart - ${count} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>My Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[10px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right actions */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Search"
              className="text-[var(--color-dark-900)]"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/cart"
              className="relative text-[var(--color-dark-900)]"
              aria-label={`Cart - ${count} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[10px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <button
              className="text-[var(--color-dark-900)]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Search bar drop-down ── */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-[var(--color-light-100)] border-b border-[var(--color-light-300)] shadow-md z-50 px-6 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dark-500)] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for shoes, styles, colours…"
                  className="w-full h-11 pl-10 pr-4 border border-[var(--color-light-300)] text-[length:var(--text-body)] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-caption)] font-medium hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none whitespace-nowrap"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                aria-label="Close search"
                className="text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden bg-[var(--color-light-100)] border-t border-[var(--color-light-300)] px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[var(--color-light-300)]" />
            <Link
              href="/cart"
              className="flex items-center gap-2 text-[length:var(--text-body)] text-[var(--color-dark-900)]"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              My Cart {count > 0 && `(${count})`}
            </Link>
          </div>
        )}
      </nav>

      {/* Backdrop — closes search when clicking outside */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
