import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import type Stripe from "stripe";

interface OrderSuccessProps {
  session: Stripe.Checkout.Session;
}

export default function OrderSuccess({ session }: OrderSuccessProps) {
  const total = ((session.amount_total ?? 0) / 100).toFixed(2);
  const email = session.customer_details?.email;
  const name = session.customer_details?.name;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-16 px-4 max-w-lg mx-auto">
      <CheckCircle className="w-16 h-16 text-[var(--color-green)]" />

      <div className="flex flex-col gap-2">
        <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
          Order Confirmed
        </h1>
        <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)]">
          {name ? `Thanks, ${name}!` : "Thank you for your order!"} We&apos;ve received your payment and will get it shipped soon.
        </p>
        {email && (
          <p className="text-[length:var(--text-caption)] text-[var(--color-dark-500)]">
            A confirmation will be sent to <span className="text-[var(--color-dark-900)] font-medium">{email}</span>
          </p>
        )}
      </div>

      {/* Order summary card */}
      <div className="w-full border border-[var(--color-light-300)] p-5 flex flex-col gap-4 text-left">
        <div className="flex items-center gap-2 text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
          <Package className="w-4 h-4 shrink-0" />
          <span>Order reference: <span className="font-medium text-[var(--color-dark-900)] break-all">{session.id}</span></span>
        </div>

        <div className="border-t border-[var(--color-light-300)] pt-4 flex justify-between text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
          <span>Total paid</span>
          <span>${total}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/products"
          className="flex-1 h-12 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-dark-700)] transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="flex-1 h-12 border border-[var(--color-light-300)] text-[var(--color-dark-900)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center hover:bg-[var(--color-light-200)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
