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
  // Google OAuth — requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars
  // Redirect URI for local dev: http://localhost:3000/api/auth/callback/google
  // Add this URI in Google Cloud Console → APIs & Services → Credentials
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  session: {
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
