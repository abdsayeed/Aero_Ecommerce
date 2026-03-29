import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "";

// Provide a real DB only when valid URL is present.
// During `next build` with placeholder URL, this gracefully returns null.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (url && !url.startsWith("your-neon")) {
    const sql = neon(url);
    db = drizzle(sql, { schema });
}

export { db };
