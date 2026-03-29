import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── pure black, logo top-left, tagline bottom-left */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-10 shrink-0">

        {/* Orange logo mark — top left */}
        <Link href="/" aria-label="Go to Aero Store">
          <div className="w-11 h-11 bg-[var(--color-orange)] rounded-xl flex items-center justify-center shrink-0">
            <svg width="24" height="9" viewBox="0 0 80 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M79.7143 0L21.418 25.1469C16.5644 27.2409 12.4814 28.2857 9.19105 28.2857C5.48886 28.2857 2.79193 26.9572 1.13569 24.3047C-1.01212 20.8822 -0.0732836 15.379 3.6112 9.56968C5.79885 6.17413 8.57993 3.05779 11.2901 0.0765583C10.6524 1.13035 5.02387 10.655 11.1794 15.1404C12.3973 16.041 14.1288 16.4824 16.2589 16.4824C17.9683 16.4824 19.9301 16.1986 22.0867 15.6267L79.7143 0Z" fill="white"/>
            </svg>
          </div>
        </Link>

        {/* Bottom content */}
        <div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-4">
            Just Do It
          </h2>
          <p className="text-[var(--color-dark-500)] text-base leading-relaxed max-w-[280px]">
            Join millions of athletes and fitness enthusiasts who trust Aero for their performance needs.
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
            <div className="w-10 h-10 bg-[var(--color-orange)] rounded-xl flex items-center justify-center">
              <svg width="22" height="8" viewBox="0 0 80 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M79.7143 0L21.418 25.1469C16.5644 27.2409 12.4814 28.2857 9.19105 28.2857C5.48886 28.2857 2.79193 26.9572 1.13569 24.3047C-1.01212 20.8822 -0.0732836 15.379 3.6112 9.56968C5.79885 6.17413 8.57993 3.05779 11.2901 0.0765583C10.6524 1.13035 5.02387 10.655 11.1794 15.1404C12.3973 16.041 14.1288 16.4824 16.2589 16.4824C17.9683 16.4824 19.9301 16.1986 22.0867 15.6267L79.7143 0Z" fill="white"/>
              </svg>
            </div>
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
