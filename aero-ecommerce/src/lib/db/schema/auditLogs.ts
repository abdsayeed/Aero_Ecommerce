import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").notNull(),
    action: text("action").notNull(),           // e.g. "product.update", "order.status_change"
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_audit_logs_actor_id").on(t.actorId),
    index("idx_audit_logs_resource").on(t.resourceType, t.resourceId),
    index("idx_audit_logs_created_at").on(t.createdAt),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
