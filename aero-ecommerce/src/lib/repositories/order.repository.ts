import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, payments } from "@/lib/db/schema/orders";
import { addresses } from "@/lib/db/schema/addresses";

export type OrderWithItems = typeof orders.$inferSelect & {
  items: (typeof orderItems.$inferSelect)[];
  payment: typeof payments.$inferSelect | null;
};

export const OrderRepository = {
  async findByTransactionId(transactionId: string) {
    if (!db) return null;
    const rows = await db
      .select({ orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.transactionId, transactionId))
      .limit(1);
    return rows[0]?.orderId ?? null;
  },

  async findById(id: string) {
    if (!db) return null;
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByUserId(userId: string) {
    if (!db) return [];
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  },

  async listAll() {
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  },

  async updateStatus(id: string, status: typeof orders.$inferSelect["status"]) {
    if (!db) return null;
    const rows = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async createWithItems(data: {
    order: typeof orders.$inferInsert;
    items: Omit<typeof orderItems.$inferInsert, "orderId">[];
    payment: Omit<typeof payments.$inferInsert, "orderId">;
    shippingAddress?: typeof addresses.$inferInsert;
    billingAddress?: typeof addresses.$inferInsert;
  }) {
    if (!db) return null;

    let shippingAddressId: string | undefined;
    let billingAddressId: string | undefined;

    if (data.shippingAddress) {
      const [row] = await db
        .insert(addresses)
        .values(data.shippingAddress)
        .returning({ id: addresses.id });
      shippingAddressId = row.id;
    }

    if (data.billingAddress) {
      const [row] = await db
        .insert(addresses)
        .values(data.billingAddress)
        .returning({ id: addresses.id });
      billingAddressId = row.id;
    }

    const [order] = await db
      .insert(orders)
      .values({ ...data.order, shippingAddressId, billingAddressId })
      .returning();

    if (data.items.length > 0) {
      await db
        .insert(orderItems)
        .values(data.items.map((item) => ({ ...item, orderId: order.id })));
    }

    await db.insert(payments).values({ ...data.payment, orderId: order.id });

    return order;
  },
};
