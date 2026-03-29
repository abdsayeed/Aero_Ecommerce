import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  // db may be null during build — better-auth is never called at build time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: db ? drizzleAdapter(db, { provider: "pg", schema }) : ({} as any),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieName: "auth_session",
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-placeholder",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type Auth = typeof auth;
