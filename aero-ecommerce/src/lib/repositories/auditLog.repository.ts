import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema/auditLogs";

export const AuditLogRepository = {
  async create(data: typeof auditLogs.$inferInsert) {
    if (!db) return null;
    const [row] = await db.insert(auditLogs).values(data).returning();
    return row;
  },

  async findByResource(resourceType: string, resourceId: string) {
    if (!db) return [];
    return db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.resourceType, resourceType),
          eq(auditLogs.resourceId, resourceId)
        )
      )
      .orderBy(desc(auditLogs.createdAt));
  },

  async findByActor(actorId: string) {
    if (!db) return [];
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorId, actorId))
      .orderBy(desc(auditLogs.createdAt));
  },
};
