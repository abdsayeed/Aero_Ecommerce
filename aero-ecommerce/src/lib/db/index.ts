import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (url && !url.startsWith("your-neon")) {
  const sql = neon(url);
  db = drizzle(sql, { schema });
}

export { db };
export type Db = NonNullable<typeof db>;
