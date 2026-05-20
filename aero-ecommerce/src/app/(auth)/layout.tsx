import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── dark with brand */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-dark-900)] flex-col justify-between p-10 shrink-0">

        {/* Logo — top left */}
        <Link href="/" aria-label="Go to Aervyn">
          <span className="text-xl font-semibold tracking-[0.15em] uppercase text-[var(--color-light-100)]">
            AERVYN
          </span>
        </Link>

        {/* Bottom content */}
        <div>
          <h2 className="text-5xl font-semibold text-white leading-tight mb-4 tracking-[-0.02em]">
            Stand Out.
          </h2>
          <p className="text-[var(--color-dark-500)] text-[15px] leading-relaxed max-w-[300px]">
            Premium minimalist streetwear for the modern man.
            Oversized fits, luxury fabrics, timeless design.
          </p>
          {/* Dot indicators */}
          <div className="flex gap-2 mt-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-beige)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-charcoal)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-charcoal)]" />
          </div>
          <p className="mt-10 text-[11px] text-[var(--color-dark-700)]">
            © {new Date().getFullYear()} Aervyn. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── white, form top-aligned */}
      <div className="flex-1 bg-white flex flex-col min-h-screen">

        {/* Mobile: show logo at top */}
        <div className="lg:hidden p-6">
          <Link href="/" aria-label="Go to Aervyn">
            <span className="text-lg font-semibold tracking-[0.15em] uppercase text-[var(--color-dark-900)]">
              AERVYN
            </span>
          </Link>
        </div>

        {/* Form wrapper — horizontally centered, top-padded */}
        <div className="flex-1 flex flex-col items-center px-8 pt-12 pb-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
