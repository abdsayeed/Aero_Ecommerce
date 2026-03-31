import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { products, productVariants, productImages } from "@/lib/db/schema/products";
import { user } from "@/lib/db/schema/user";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq, sql, inArray, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:      "bg-green-50 text-green-700",
    shipped:   "bg-blue-50 text-blue-700",
    delivered: "bg-green-50 text-green-700",
    pending:   "bg-orange-50 text-orange-600",
    cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "paid" || status === "delivered" ? "bg-green-500" : status === "shipped" ? "bg-blue-500" : status === "pending" ? "bg-orange-500" : "bg-red-500"}`} />
      {status}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const adminName = session?.user?.name ?? "Admin";

  if (!db) {
    return <p className="text-red-500">Database unavailable.</p>;
  }

  // ── Fetch all stats in parallel ──────────────────────────────────────────
  const [
    revenueRows,
    customerCountRows,
    orderCountRows,
    avgOrderRows,
    recentOrderRows,
    topProductRows,
  ] = await Promise.all([
    // Total revenue
    db.select({ total: sql<string>`coalesce(sum(${orders.totalAmount}::numeric), 0)::text` }).from(orders),
    // Total customers
    db.select({ count: sql<number>`count(*)::int` }).from(user).where(eq(user.role, "user")),
    // Total orders
    db.select({ count: sql<number>`count(*)::int` }).from(orders),
    // Average order value
    db.select({ avg: sql<string>`coalesce(avg(${orders.totalAmount}::numeric), 0)::text` }).from(orders),
    // Recent 5 orders with customer info
    db
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
      .limit(5),
    // Top 5 products by units sold
    db
      .select({
        productId: productVariants.productId,
        totalSold: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .groupBy(productVariants.productId)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
  ]);

  const totalRevenue = parseFloat(revenueRows[0]?.total ?? "0");
  const totalCustomers = customerCountRows[0]?.count ?? 0;
  const totalOrders = orderCountRows[0]?.count ?? 0;
  const avgOrder = parseFloat(avgOrderRows[0]?.avg ?? "0");

  // Fetch names + images for top products
  const topProductIds = topProductRows.map((r) => r.productId);
  const [topProductDetails, topProductImages] = topProductIds.length
    ? await Promise.all([
        db
          .select({ id: products.id, name: products.name })
          .from(products)
          .where(inArray(products.id, topProductIds)),
        db
          .select({ productId: productImages.productId, url: productImages.url })
          .from(productImages)
          .where(and(inArray(productImages.productId, topProductIds), eq(productImages.isPrimary, true))),
      ])
    : [[], []];

  const productNameMap = new Map(topProductDetails.map((p) => [p.id, p.name]));
  const productImageMap = new Map(topProductImages.map((i) => [i.productId, i.url]));

  // Fetch customer names for recent orders
  const userIds = recentOrderRows.map((o) => o.userId).filter(Boolean) as string[];
  const customerRows = userIds.length
    ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.id, userIds))
    : [];
  const customerMap = new Map(customerRows.map((u) => [u.id, u.name ?? u.email]));

  return (
    <div className="flex flex-col gap-8">

      {/* ── Welcome ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {adminName}!</h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening in your store today</p>
        </div>
        <Link
          href="/admin/orders"
          className="h-10 px-5 rounded-full bg-gray-900 text-white text-sm font-medium flex items-center hover:bg-gray-700 transition-colors"
        >
          View All Orders
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${totalOrders} orders total`}
        />
        <StatCard
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
          sub="Registered accounts"
        />
        <StatCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          sub="All time"
        />
        <StatCard
          label="Avg. Order Value"
          value={`$${avgOrder.toFixed(2)}`}
          sub="Per transaction"
        />
      </div>

      {/* ── Bottom two-column grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        {/* ── Recent Orders ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline font-medium">
              View All
            </Link>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] gap-3 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          {recentOrderRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <ShoppingBag className="w-8 h-8" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            recentOrderRows.map((order) => {
              const customerLabel = order.userId
                ? (customerMap.get(order.userId) ?? `User …${order.userId.slice(-4)}`)
                : (order.guestEmail ?? "Guest");
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] gap-3 px-6 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-mono font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-sm text-blue-600 truncate">{customerLabel}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              );
            })
          )}
        </div>

        {/* ── Top Products ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline font-medium">
              View All
            </Link>
          </div>

          {topProductRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <ShoppingBag className="w-8 h-8" />
              <p className="text-sm">No sales yet</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {topProductRows.map((row) => {
                const name = productNameMap.get(row.productId) ?? "Unknown Product";
                const img = productImageMap.get(row.productId);
                return (
                  <div key={row.productId} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="relative w-11 h-11 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {img ? (
                        <Image src={img} alt={name} fill className="object-contain p-1" sizes="44px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-400 font-mono">ID: {row.productId.slice(0, 8)}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 shrink-0">
                      {row.totalSold >= 1000 ? `${(row.totalSold / 1000).toFixed(1)}K` : row.totalSold} Sales
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
