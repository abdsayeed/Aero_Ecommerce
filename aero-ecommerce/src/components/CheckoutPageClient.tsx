"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, MapPin, Loader2, ShoppingBag, Search, Tag, Check } from "lucide-react";
import { createStripeCheckoutSession } from "@/lib/actions/checkout";
import { validateCoupon } from "@/lib/actions/coupons";
import type { CartLineItem } from "@/store/cart.store";

interface Props {
  initialItems: CartLineItem[];
  cartId: string;
}

type DeliveryMode = "delivery" | "pickup";

// Estimate delivery date ~5 days from now
function getEstimatedDelivery(): string {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function CheckoutPageClient({ initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DeliveryMode>("delivery");
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, setCouponPending] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: string;
  } | null>(null);

  const subtotal = initialItems.reduce(
    (sum, i) => sum + parseFloat(i.salePrice ?? i.price) * i.quantity,
    0
  );
  const shipping = subtotal >= 50 ? 0 : 9.99;

  // Calculate discount
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (subtotal * parseFloat(appliedCoupon.discountValue)) / 100
      : Math.min(parseFloat(appliedCoupon.discountValue), subtotal)
    : 0;

  const total = Math.max(0, subtotal - discount + shipping);

  const handleField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createStripeCheckoutSession(appliedCoupon?.code);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(result.url);
    });
  };

  const inputCls =
    "w-full h-12 px-4 border border-[var(--color-light-300)] text-[length:var(--text-body)] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors";

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-start w-full">

      {/* ══════════════════════════════════════════
          LEFT — Delivery form  (~60%)
      ══════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 w-full">

        {/* Section heading */}
        <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-4">
          Delivery Options
        </h2>

        {/* Delivery / Pick-Up toggle — matches reference exactly */}
        <div className="flex border border-[var(--color-dark-900)] mb-6">
          <button
            type="button"
            onClick={() => setMode("delivery")}
            className={`flex-1 flex items-center justify-center gap-2 h-12 text-[length:var(--text-body)] font-medium transition-colors focus:outline-none ${
              mode === "delivery"
                ? "bg-[var(--color-dark-900)] text-[var(--color-light-100)]"
                : "bg-[var(--color-light-100)] text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)]"
            }`}
          >
            <Truck className="w-4 h-4" />
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setMode("pickup")}
            className={`flex-1 flex items-center justify-center gap-2 h-12 text-[length:var(--text-body)] font-medium transition-colors focus:outline-none border-l border-[var(--color-dark-900)] ${
              mode === "pickup"
                ? "bg-[var(--color-dark-900)] text-[var(--color-light-100)]"
                : "bg-[var(--color-light-100)] text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Pick-Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleField}
            placeholder="Email*"
            required
            className={inputCls}
          />

          {/* First / Last name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleField}
              placeholder="First Name*"
              required
              className={inputCls}
            />
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleField}
              placeholder="Last Name*"
              required
              className={inputCls}
            />
          </div>

          {/* Address with search icon */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-dark-500)] pointer-events-none" />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleField}
              placeholder="Start typing address"
              className={`${inputCls} pl-10`}
            />
          </div>
          <button
            type="button"
            className="self-start text-[length:var(--text-footnote)] text-[var(--color-dark-700)] underline underline-offset-2 hover:text-[var(--color-dark-900)] -mt-1"
          >
            Enter address manually
          </button>

          {/* Phone — narrower, left-aligned like reference */}
          <div className="w-1/2">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleField}
              placeholder="Phone Number*"
              required
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[length:var(--text-footnote)] text-[var(--color-red)] border border-red-200 bg-red-50 px-3 py-2 mt-1">
              {error}
            </p>
          )}

          {/* Save & Continue — grey pill, right-aligned */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isPending}
              className="h-12 px-10 rounded-full bg-[var(--color-dark-500)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium flex items-center gap-2 hover:bg-[var(--color-dark-700)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Redirecting…</>
                : "Save & Continue"
              }
            </button>
          </div>
        </form>

        {/* Collapsed lower steps */}
        <div className="mt-8">
          <div className="border-t border-[var(--color-light-300)] py-5">
            <h3 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-500)]">
              Payment
            </h3>
          </div>
          <div className="border-t border-[var(--color-light-300)] py-5">
            <h3 className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-500)]">
              Order Review
            </h3>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — In Your Bag summary  (~35%)
      ══════════════════════════════════════════ */}
      <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
            In Your Bag
          </h2>
          <Link
            href="/cart"
            className="text-[length:var(--text-caption)] text-[var(--color-dark-900)] underline underline-offset-2 hover:text-[var(--color-dark-700)] transition-colors"
          >
            Edit
          </Link>
        </div>

        {/* Totals */}
        <div className="flex flex-col gap-2 text-[length:var(--text-caption)]">
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-[var(--color-dark-700)]">
              Subtotal
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[var(--color-dark-500)] text-[var(--color-dark-500)] text-[9px] font-bold leading-none">
                ?
              </span>
            </span>
            <span className="font-medium text-[var(--color-dark-900)]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-dark-700)]">Delivery</span>
            <span className="font-medium text-[var(--color-dark-900)]">
              {shipping === 0 ? "$0.00" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] border-t border-[var(--color-light-300)] mt-3 pt-3 mb-3">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Coupon code */}
        {!appliedCoupon ? (
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-dark-500)] pointer-events-none" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                  placeholder="Coupon code"
                  className="w-full h-9 pl-8 pr-3 border border-[var(--color-light-300)] text-[length:var(--text-footnote)] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
                />
              </div>
              <button
                type="button"
                disabled={couponPending || !couponInput.trim()}
                onClick={async () => {
                  setCouponPending(true);
                  setCouponError(null);
                  const result = await validateCoupon(couponInput.trim());
                  setCouponPending(false);
                  if (result.valid) {
                    setAppliedCoupon({ code: result.code, discountType: result.discountType, discountValue: result.discountValue });
                    setCouponInput("");
                  } else {
                    setCouponError(result.error);
                  }
                }}
                className="h-9 px-4 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-footnote)] font-medium hover:bg-[var(--color-dark-700)] transition-colors disabled:opacity-50"
              >
                {couponPending ? "…" : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-[length:var(--text-footnote)] text-[var(--color-red)] mt-1">{couponError}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 px-3 py-2 bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[var(--color-green)]" />
              <span className="text-[length:var(--text-footnote)] font-medium text-[var(--color-green)]">
                {appliedCoupon.code} — {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${parseFloat(appliedCoupon.discountValue).toFixed(2)} off`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAppliedCoupon(null)}
              className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] hover:text-[var(--color-dark-900)] transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {/* Estimated arrival */}
        <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] mb-4">
          Arrives by {getEstimatedDelivery()}
        </p>
        <div className="flex flex-col gap-4">
          {initialItems.map((item) => {
            const unitPrice = parseFloat(item.salePrice ?? item.price);
            return (
              <div key={item.cartItemId} className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-[72px] h-[72px] shrink-0 bg-[var(--color-light-200)]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-contain p-1"
                      sizes="72px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-[var(--color-light-400)]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] leading-snug">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">
                        {item.productName}
                      </p>
                    </div>
                  </div>
                  <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)] mt-0.5">
                    {item.colorName}
                  </p>
                  <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
                    Qty: {item.quantity} &nbsp;|&nbsp; Size: {item.sizeName}
                  </p>
                  {item.inStock <= 3 && item.inStock > 0 && (
                    <p className="flex items-center gap-1 text-[length:var(--text-footnote)] text-[var(--color-orange)] mt-0.5">
                      <span className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-[var(--color-orange)] text-[7px] font-bold leading-none shrink-0">
                        !
                      </span>
                      Just a few left.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
