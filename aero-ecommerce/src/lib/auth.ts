import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
    // db may be null during build – better-auth won't be called at build time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    database: db ? drizzleAdapter(db, { provider: "pg" }) : ({} as any),
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-placeholder",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});
