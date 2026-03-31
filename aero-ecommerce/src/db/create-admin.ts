import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema/index.js";
import { createHash, randomBytes } from "crypto";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Better Auth uses scrypt for password hashing.
// We call the Better Auth sign-up API directly so the hash is correct.

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const ADMIN_EMAIL = "admin@aerostore.com";
const ADMIN_PASSWORD = "Admin@Aero2025";
const ADMIN_NAME = "Aero Admin";

async function main() {
  console.log("Creating admin account...");

  // Check if user already exists
  const existing = await db
    .select({ id: schema.user.id, role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    // Already exists — just ensure role is admin
    await db
      .update(schema.user)
      .set({ role: "admin" })
      .where(eq(schema.user.email, ADMIN_EMAIL));
    console.log(`✓ User already exists. Role set to admin.`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    return;
  }

  // Create via Better Auth HTTP API (handles password hashing correctly)
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE_URL,
    },
    body: JSON.stringify({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error("Sign-up failed:", body);
    process.exit(1);
  }

  const data = await res.json();
  const userId = data?.user?.id;

  if (!userId) {
    console.error("No user ID returned from sign-up:", data);
    process.exit(1);
  }

  // Promote to admin
  await db
    .update(schema.user)
    .set({ role: "admin" })
    .where(eq(schema.user.id, userId));

  console.log("✓ Admin account created successfully.");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  User ID:  ${userId}`);
  console.log("\nVisit http://localhost:3000/admin/products after signing in.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
