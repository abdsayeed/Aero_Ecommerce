import { redirect } from "next/navigation";
import { getCart } from "@/lib/actions/cart";
import CheckoutPageClient from "@/components/CheckoutPageClient";

export default async function CheckoutPage() {
  const cartResult = await getCart();

  if (!cartResult || cartResult.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="min-h-screen bg-[var(--color-light-100)]">
      {/* Minimal header — Aervyn checkout */}
      <header className="border-b border-[var(--color-light-300)] py-5 text-center">
        <span className="text-lg font-semibold tracking-[0.15em] uppercase text-[var(--color-dark-900)]">
          AERVYN
        </span>
        <p className="text-[11px] tracking-[0.1em] uppercase text-[var(--color-dark-500)] mt-1">
          Checkout
        </p>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <CheckoutPageClient
          initialItems={cartResult.items}
          cartId={cartResult.cartId}
        />
      </main>
    </div>
  );
}
