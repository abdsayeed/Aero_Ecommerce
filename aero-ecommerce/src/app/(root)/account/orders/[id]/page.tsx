import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getMyOrder } from "@/lib/actions/account";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getMyOrder(id);

  if ("error" in result) notFound();

  const { data: order } = result;

  return (
    <div>
      <Link href="/account/orders" className="flex items-center gap-1.5 text-[length:var(--text-caption)] text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[length:var(--text-caption)] text-[var(--color-dark-500)] mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="text-[length:var(--text-caption)] font-medium px-3 py-1 bg-[var(--color-light-200)] text-[var(--color-dark-900)] capitalize">
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="border border-[var(--color-light-300)] mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 border-b border-[var(--color-light-300)] last:border-0">
            <div className="relative w-20 h-20 shrink-0 bg-[var(--color-light-200)]">
              {item.image ? (
                <Image src={item.image} alt={item.productName} fill className="object-contain p-1.5" sizes="80px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[var(--color-light-400)]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)]">{item.productName}</p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">{item.colorName} · Size {item.sizeName}</p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">Qty: {item.quantity}</p>
            </div>
            <p className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)] shrink-0">
              ${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="border border-[var(--color-light-300)] p-4">
          <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-3">Summary</h2>
          <div className="flex justify-between text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] border-t border-[var(--color-light-300)] pt-3">
            <span>Total</span>
            <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
          {order.couponCode && (
            <p className="text-[length:var(--text-footnote)] text-[var(--color-green)] mt-1">Coupon applied: {order.couponCode}</p>
          )}
          {order.stripeTransactionId && (
            <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] mt-2">
              Payment ref: <span className="font-mono">{order.stripeTransactionId}</span>
            </p>
          )}
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="border border-[var(--color-light-300)] p-4">
            <h2 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-3">Shipped To</h2>
            <address className="not-italic text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        )}
      </div>
    </div>
  );
}
