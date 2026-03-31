import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getMyOrders } from "@/lib/actions/account";

const statusColors: Record<string, string> = {
  pending: "text-[var(--color-orange)] bg-orange-50",
  paid: "text-[var(--color-green)] bg-green-50",
  shipped: "text-blue-600 bg-blue-50",
  delivered: "text-[var(--color-green)] bg-green-50",
  cancelled: "text-[var(--color-red)] bg-red-50",
};

export default async function OrdersPage() {
  const result = await getMyOrders();

  if ("error" in result) {
    return <p className="text-[var(--color-red)] text-[length:var(--text-body)]">{result.error}</p>;
  }

  const { data: orders } = result;

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <ShoppingBag className="w-12 h-12 text-[var(--color-light-300)]" />
        <h2 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">No orders yet</h2>
        <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)]">Your order history will appear here.</p>
        <Link href="/products" className="mt-2 px-6 py-2.5 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Order History</h1>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex items-center justify-between p-4 border border-[var(--color-light-300)] hover:border-[var(--color-dark-900)] transition-colors group"
          >
            <div className="flex flex-col gap-1">
              <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)]">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[length:var(--text-footnote)] font-medium px-2 py-0.5 capitalize ${statusColors[order.status] ?? "text-[var(--color-dark-700)]"}`}>
                {order.status}
              </span>
              <span className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
                ${parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
