import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Featured: ["Air Force 1", "Huarache", "Air Max 90", "Air Max 95"],
  Shoes: ["All Shoes", "Custom Shoes", "Jordan Shoes", "Running Shoes"],
  Clothing: ["All Clothing", "Modest Wear", "Hoodies & Pullovers", "Shirts & Tops"],
  "Kids'": [
    "Infant & Toddler Shoes",
    "Kids' Shoes",
    "Kids' Jordan Shoes",
    "Kids' Basketball Shoes",
  ],
};

const legalLinks = ["Guides", "Terms of Sale", "Terms of Use", "Nike Privacy Policy"];

const socialLinks = [
  { src: "/x.svg", alt: "X (Twitter)", label: "X" },
  { src: "/facebook.svg", alt: "Facebook", label: "Facebook" },
  { src: "/instagram.svg", alt: "Instagram", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark-900)] text-[var(--color-light-100)] font-[var(--font-jost)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Logo */}
          <div className="flex-shrink-0">
            <svg width="70" height="25" viewBox="0 0 80 29" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M79.7143 0L21.418 25.1469C16.5644 27.2409 12.4814 28.2857 9.19105 28.2857C5.48886 28.2857 2.79193 26.9572 1.13569 24.3047C-1.01212 20.8822 -0.0732836 15.379 3.6112 9.56968C5.79885 6.17413 8.57993 3.05779 11.2901 0.0765583C10.6524 1.13035 5.02387 10.655 11.1794 15.1404C12.3973 16.041 14.1288 16.4824 16.2589 16.4824C17.9683 16.4824 19.9301 16.1986 22.0867 15.6267L79.7143 0Z" fill="white"/></svg>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-light-100)] mb-4">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[length:var(--text-caption)] text-[var(--color-dark-500)] hover:text-[var(--color-light-100)] transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex lg:flex-col items-start gap-3">
            {socialLinks.map(({ src, alt, label }) => (
              <Link
                key={label}
                href="#"
                aria-label={alt}
                className="w-9 h-9 rounded-full border border-[var(--color-dark-700)] flex items-center justify-center hover:border-[var(--color-light-100)] transition-colors p-2"
              >
                <Image src={src} alt={alt} width={18} height={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-dark-700)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] flex items-center gap-1">
            <span>📍</span>
            <span className="text-[var(--color-light-100)] font-medium">Croatia</span>
            <span>© {new Date().getFullYear()} Aero Store, Inc. All Rights Reserved</span>
          </p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] hover:text-[var(--color-light-100)] transition-colors"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
