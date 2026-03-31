"use client";

import { useEffect, useTransition, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { clearCart, updateCartItem, removeCartItem } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import type { CartLineItem } from "@/store/cart.store";

interface CartClientProps {
  initialItems: CartLineItem[];
  isLoggedIn?: boolean;
}

// ─── Inline cart item row (Nike-style) ───────────────────────────────────────

function CartItem({ item }: { item: CartLineItem }) {
  const [isPending, startTransition] = useTransition();
  const { updateQuantity, removeItem, setItems } = useCartStore();

  const unitPrice = parseFloat(item.salePrice ?? item.price);
  const lineTotal = unitPrice * item.quantity;

  const handleQty = (delta: number) => {
    const next = item.quantity + delta;
    if (next <= 0) {
      removeItem(item.cartItemId);
    } else {
      updateQuantity(item.cartItemId, next);
    }
    startTransition(async () => {
      const result = await updateCartItem(item.cartItemId, next);
      if (result) setItems(result.items);
    });
  };

  const handleRemove = () => {
    removeItem(item.cartItemId);
    startTransition(async () => {
      const result = await removeCartItem(item.cartItemId);
      if (result) setItems(result.items);
    });
  };

  return (
    <div className={`flex gap-4 py-6 border-b border-[var(--color-light-300)] transition-opacity ${isPending ? "opacity-40" : ""}`}>
      {/* Product image */}
      <div className="relative w-28 h-28 shrink-0 bg-[var(--color-light-200)]">
        {item.image ? (
          <Image src={item.image} alt={item.productName} fill className="object-contain p-2" sizes="112px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[var(--color-light-400)]" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Name + price row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)] leading-snug">
              {item.productName}
            </h3>
            <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
              {item.colorName}
            </p>
            <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
              Size {item.sizeName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)]">
              ${lineTotal.toFixed(2)}
            </span>
            {item.salePrice && (
              <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] line-through">
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Low stock warning */}
        {item.inStock <= 3 && item.inStock > 0 && (
          <p className="mt-1 text-[length:var(--text-footnote)] text-[var(--color-orange)] flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border border-[var(--color-orange)] flex items-center justify-center text-[8px] font-bold">!</span>
            Just a few left.
          </p>
        )}

        {/* Qty controls + remove */}
        <div className="flex items-center gap-3 mt-auto pt-3">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Remove item"
            className="w-8 h-8 flex items-center justify-center text-[var(--color-dark-700)] hover:text-[var(--color-red)] border border-[var(--color-light-300)] hover:border-[var(--color-red)] transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center border border-[var(--color-light-300)]">
            <button
              type="button"
              onClick={() => handleQty(-1)}
              disabled={isPending}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)] transition-colors disabled:opacity-40"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQty(1)}
              disabled={isPending || item.quantity >= item.inStock}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)] transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main CartClient ──────────────────────────────────────────────────────────

export default function CartClient({ initialItems, isLoggedIn = false }: CartClientProps) {
  const { items, setItems, clearItems, totalItems, totalPrice } = useCartStore();
  const [isClearPending, startClearTransition] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  const subtotal = totalPrice();
  const shipping = subtotal > 0 && subtotal < 50 ? 9.99 : 0;
  const total = subtotal + shipping;
  const count = totalItems();

  const handleClearCart = () => {
    clearItems();
    startClearTransition(async () => { await clearCart(); });
  };

  const handleCheckout = () => {
    setCheckoutError(null);
    // Skip the options screen if already logged in
    router.push(isLoggedIn ? "/checkout" : "/checkout/options");
  };

  // ── Empty state ──
  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <ShoppingBag className="w-14 h-14 text-[var(--color-light-300)]" />
        <h2 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
          Your bag is empty
        </h2>
        <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)] max-w-sm">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors"
        >
          Shop Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

      {/* ── Left: Bag items ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-light-300)] mb-1">
          <h2 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
            Bag
          </h2>
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearPending}
            className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)] underline underline-offset-2 hover:text-[var(--color-red)] transition-colors disabled:opacity-40"
          >
            Clear all
          </button>
        </div>

        {/* Items */}
        <div>
          {items.map((item) => (
            <CartItem key={item.cartItemId} item={item} />
          ))}
        </div>

        {/* Free returns */}
        <div className="mt-5 flex items-center gap-2 text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
          <div className="w-5 h-5 border border-[var(--color-light-300)] flex items-center justify-center shrink-0">
            <ArrowRight className="w-3 h-3 rotate-180" />
          </div>
          Free returns and exchanges.{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-[var(--color-dark-900)]">
            Learn More
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href="/products"
            className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] underline underline-offset-4 hover:text-[var(--color-dark-900)] transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Right: Summary ── */}
      <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-6">
        <h2 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-5">
          Summary
        </h2>

        {/* Totals */}
        <div className="flex flex-col gap-3 text-[length:var(--text-caption)]">
          <div className="flex justify-between text-[var(--color-dark-700)]">
            <span className="flex items-center gap-1">
              Subtotal
              <span className="w-4 h-4 rounded-full border border-[var(--color-dark-500)] text-[var(--color-dark-500)] text-[10px] flex items-center justify-center font-bold leading-none">?</span>
            </span>
            <span className="font-medium text-[var(--color-dark-900)]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-dark-700)]">
            <span>Estimated Delivery &amp; Handling</span>
            <span className="font-medium text-[var(--color-dark-900)]">
              {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--color-light-300)] mt-4 pt-4 flex justify-between text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Checkout button — works for both guests and logged-in users */}
        {checkoutError && (
          <p className="mt-4 text-[length:var(--text-footnote)] text-[var(--color-red)] bg-red-50 border border-red-200 px-3 py-2">
            {checkoutError}
          </p>
        )}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={count === 0}
          className="mt-5 w-full h-14 rounded-full bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Checkout
        </button>

        {/* Guest note */}
        <p className="mt-3 text-center text-[length:var(--text-footnote)] text-[var(--color-dark-500)]">
          Guest checkout available · No account required
        </p>

        {/* Trust badges */}
        <div className="mt-5 flex flex-col gap-2 text-[length:var(--text-footnote)] text-[var(--color-dark-700)] border-t border-[var(--color-light-300)] pt-4">
          <p>✓ Free returns within 30 days</p>
          <p>✓ Secure checkout powered by Stripe</p>
          <p>✓ Free shipping on orders over $50</p>
        </div>
      </div>
    </div>
  );
}
