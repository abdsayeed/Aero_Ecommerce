import Link from "next/link";
import Image from "next/image";

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Featured: [
    { label: "Air Force 1", href: "/products?search=Air+Force+1" },
    { label: "Huarache", href: "/products?search=Huarache" },
    { label: "Air Max 90", href: "/products?search=Air+Max+90" },
    { label: "Air Max 95", href: "/products?search=Air+Max+95" },
  ],
  Shoes: [
    { label: "All Shoes", href: "/products" },
    { label: "Custom Shoes", href: "/products" },
    { label: "Running Shoes", href: "/products?category=running" },
    { label: "Training Shoes", href: "/products?category=training" },
  ],
  "Kids'": [
    { label: "Infant & Toddler Shoes", href: "/products?gender=kids" },
    { label: "Kids' Shoes", href: "/products?gender=kids" },
    { label: "Kids' Basketball Shoes", href: "/products?gender=kids&category=basketball" },
    { label: "Kids' Running Shoes", href: "/products?gender=kids&category=running" },
  ],
};

const legalLinks: { label: string; href: string }[] = [
  { label: "Guides", href: "/contact" },
  { label: "Terms of Sale", href: "/contact" },
  { label: "Terms of Use", href: "/contact" },
  { label: "Privacy Policy", href: "/contact" },
];

const socialLinks = [
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark-900)] text-[var(--color-light-100)] font-[var(--font-jost)]">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* Top section */}
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Logo */}
          <div className="flex-shrink-0 pt-1">
            <Link href="/" aria-label="Aero Home">
              <Image
                src="/IMG_7194.PNG"
                alt="Aero"
                width={80}
                height={52}
                className="object-contain brightness-0 invert"
              />
            </Link>
          </div>

          {/* Link columns — 3 cols (no Clothing) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-light-100)] mb-5">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[length:var(--text-caption)] text-[var(--color-dark-500)] hover:text-[var(--color-light-100)] transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social icons — inline SVG, small circles */}
          <div className="flex lg:flex-col items-start gap-3 pt-1">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-[var(--color-dark-700)] flex items-center justify-center text-[var(--color-dark-500)] hover:border-[var(--color-light-100)] hover:text-[var(--color-light-100)] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--color-dark-700)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] flex items-center gap-1.5">
            <span>📍</span>
            <span className="text-[var(--color-light-100)] font-medium">London, UK</span>
            <span>© {new Date().getFullYear()} Aero Store, Inc. All Rights Reserved</span>
          </p>
          <ul className="flex flex-wrap gap-5">
            {legalLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] hover:text-[var(--color-light-100)] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </footer>
  );
}
