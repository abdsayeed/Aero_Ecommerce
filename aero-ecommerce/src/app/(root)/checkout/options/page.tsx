import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";

export default async function CheckoutOptionsPage() {
  // If cart is empty, bounce back
  const cartResult = await getCart();
  if (!cartResult || cartResult.items.length === 0) {
    redirect("/cart");
  }

  // If already signed in, skip straight to checkout
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (session?.user) {
    redirect("/checkout");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">

      {/* ── Minimal header ── */}
      <header className="border-b border-[var(--color-light-300)] px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Aero Store Home">
          <Image
            src="/IMG_7194.PNG"
            alt="Aero"
            width={72}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
        <Link
          href="/cart"
          aria-label="Back to cart"
          className="text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </Link>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] text-center mb-12">
          Choose How You Would Like To Check Out
        </h1>

        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--color-light-300)]">

          {/* ── Left panel: Member ── */}
          <div className="bg-[var(--color-light-100)] px-10 py-12 flex flex-col items-center text-center gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
                Check out as an Aero Member for free
                <br />
                delivery on orders over £50
              </h2>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] mt-1">
                Use your Aero Member sign-in for exclusive member benefits and
                order tracking.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-2">
              <Link
                href="/sign-in?redirect=/checkout"
                className="w-full h-12 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2"
              >
                Log In
              </Link>
              <Link
                href="/sign-up?redirect=/checkout"
                className="w-full h-12 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* ── Right panel: Guest ── */}
          <div className="bg-[var(--color-light-100)] px-10 py-12 flex flex-col items-center text-center gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
                Check Out as Guest
              </h2>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] mt-1">
                You can create a free Aero Member Profile at any point during
                the checkout process.
              </p>
            </div>

            <div className="w-full mt-2">
              <Link
                href="/checkout"
                className="w-full h-12 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2"
              >
                Guest Checkout
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-light-300)] px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[length:var(--text-footnote)] text-[var(--color-dark-500)]">
          <span>© {new Date().getFullYear()} Aero Store. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link
              href="/contact"
              className="hover:text-[var(--color-dark-900)] transition-colors"
            >
              Help
            </Link>
            <Link
              href="/contact"
              className="hover:text-[var(--color-dark-900)] transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/contact"
              className="hover:text-[var(--color-dark-900)] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
