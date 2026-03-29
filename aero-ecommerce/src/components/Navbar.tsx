"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const navLinks = [
  { label: "Men", href: "#" },
  { label: "Women", href: "#" },
  { label: "Kids", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <nav className="w-full bg-[var(--color-light-100)] border-b border-[var(--color-light-300)] font-[var(--font-jost)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — inline SVG so we can control fill color */}
        <Link href="/" aria-label="Aero Store Home" className="flex-shrink-0">
          <svg width="60" height="22" viewBox="0 0 80 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M79.7143 0L21.418 25.1469C16.5644 27.2409 12.4814 28.2857 9.19105 28.2857C5.48886 28.2857 2.79193 26.9572 1.13569 24.3047C-1.01212 20.8822 -0.0732836 15.379 3.6112 9.56968C5.79885 6.17413 8.57993 3.05779 11.2901 0.0765583C10.6524 1.13035 5.02387 10.655 11.1794 15.1404C12.3973 16.041 14.1288 16.4824 16.2589 16.4824C17.9683 16.4824 19.9301 16.1986 22.0867 15.6267L79.7143 0Z" fill="#111111"/>
          </svg>
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
            aria-label="Search"
            className="flex items-center gap-1 text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <Link
            href="#"
            className="text-[length:var(--text-body)] text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors whitespace-nowrap"
          >
            My Cart ({totalItems()})
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[var(--color-dark-900)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
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
            href="#"
            className="text-[length:var(--text-body)] text-[var(--color-dark-900)]"
            onClick={() => setMenuOpen(false)}
          >
            My Cart ({totalItems()})
          </Link>
        </div>
      )}
    </nav>
  );
}
