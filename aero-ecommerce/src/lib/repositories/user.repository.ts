import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/user";

export const UserRepository = {
  async findById(id: string) {
    if (!db) return null;
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByRole(role: string) {
    if (!db) return [];
    return db.select().from(user).where(eq(user.role, role));
  },

  async findAdmins() {
    return UserRepository.findByRole("admin");
  },
};
