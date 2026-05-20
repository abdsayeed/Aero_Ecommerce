"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Menu, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=best" },
  { label: "About", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((state) => state.totalItems);

  useEffect(() => {
    setMounted(true);
  }, []);
  const count = mounted ? totalItems() : 0;

  // Scroll detection for sticky effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
      <nav
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--color-light-100)]/95 backdrop-blur-md shadow-[0_1px_0_0_var(--color-light-300)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Aervyn Home"
            className="flex-shrink-0 group"
          >
            <span
              className={`text-xl font-semibold tracking-[0.15em] uppercase transition-colors duration-300 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
            >
              AERVYN
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 hover:opacity-70 ${
                    scrolled
                      ? "text-[var(--color-dark-900)]"
                      : "text-[var(--color-light-100)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className={`transition-colors duration-300 hover:opacity-70 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className={`transition-colors duration-300 hover:opacity-70 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
            >
              <User className="w-[18px] h-[18px]" />
            </Link>
            <Link
              href="/cart"
              className={`relative transition-colors duration-300 hover:opacity-70 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
              aria-label={`Cart - ${count} items`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[9px] font-bold flex items-center justify-center leading-none">
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
              className={`transition-colors duration-300 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/cart"
              className={`relative transition-colors duration-300 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
              aria-label={`Cart - ${count} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[9px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <button
              className={`transition-colors duration-300 ${
                scrolled
                  ? "text-[var(--color-dark-900)]"
                  : "text-[var(--color-light-100)]"
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Search bar drop-down ── */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-[var(--color-light-100)] border-b border-[var(--color-light-300)] shadow-lg z-50 px-6 py-4 animate-fade-in">
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex items-center gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dark-500)] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hoodies, tees, tracksuits…"
                  className="w-full h-12 pl-11 pr-4 border border-[var(--color-light-300)] text-[14px] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[13px] font-medium tracking-wide uppercase hover:bg-[var(--color-charcoal)] transition-colors focus:outline-none whitespace-nowrap"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
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
          <div className="md:hidden bg-[var(--color-light-100)] border-t border-[var(--color-light-300)] px-6 py-6 flex flex-col gap-5 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium tracking-wide uppercase text-[var(--color-dark-900)] hover:opacity-60 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[var(--color-light-300)]" />
            <Link
              href="/account"
              className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-dark-900)]"
              onClick={() => setMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Account
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-dark-900)]"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              Cart {count > 0 && `(${count})`}
            </Link>
          </div>
        )}
      </nav>

      {/* Backdrop — closes search when clicking outside */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
