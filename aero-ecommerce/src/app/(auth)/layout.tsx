import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── pure black, logo top-left, tagline bottom-left */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-10 shrink-0">

        {/* Aero logo — top left */}
        <Link href="/" aria-label="Go to Aero Store">
          <Image
            src="/IMG_7194.PNG"
            alt="Aero"
            width={90}
            height={60}
            className="object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Bottom content */}
        <div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-4">
            Move in Style.
          </h2>
          <p className="text-[var(--color-dark-500)] text-base leading-relaxed max-w-[280px]">
            Discover footwear built for performance and designed for life. Your next pair is waiting.
          </p>
          {/* Dot indicators */}
          <div className="flex gap-2 mt-8">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-dark-700)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--color-dark-700)]" />
          </div>
          <p className="mt-10 text-xs text-[var(--color-dark-700)]">
            © {new Date().getFullYear()} Aero Store. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── white, form top-aligned */}
      <div className="flex-1 bg-white flex flex-col min-h-screen">

        {/* Mobile: show logo at top */}
        <div className="lg:hidden p-6">
          <Link href="/" aria-label="Go to Aero Store">
            <Image
              src="/IMG_7194.PNG"
              alt="Aero"
              width={72}
              height={48}
              className="object-contain"
            />
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
