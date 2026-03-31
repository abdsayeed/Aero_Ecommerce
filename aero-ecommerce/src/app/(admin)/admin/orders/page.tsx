import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { user } from "@/lib/db/schema/user";
import { eq, desc } from "drizzle-orm";
import AdminOrderRow from "@/components/admin/AdminOrderRow";

export default async function AdminOrdersPage() {
  if (!db) return <p className="text-[var(--color-red)]">Database unavailable.</p>;

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      userId: orders.userId,
      guestEmail: orders.guestEmail,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Orders</h1>
      <div className="bg-white border border-[var(--color-light-300)]">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] text-[length:var(--text-footnote)] font-semibold text-[var(--color-dark-500)] uppercase tracking-wide">
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Status</span>
        </div>
        {rows.map((o) => <AdminOrderRow key={o.id} order={o} />)}
      </div>
    </div>
  );
}
