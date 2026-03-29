"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { guest } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signUpSchema, signInSchema } from "./validation";
import { randomUUID } from "crypto";

// ─── Constants ────────────────────────────────────────────────────────────────

const GUEST_COOKIE = "guest_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

// ─── Helper: call Better Auth HTTP API and forward Set-Cookie ─────────────────

async function callAuthAPI(
  path: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BASE_URL}/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  console.log("[auth] status:", res.status);
  console.log("[auth] body:", JSON.stringify(data));

  // Forward Set-Cookie headers from Better Auth response to the browser
  const setCookies = res.headers.getSetCookie?.() ?? [];
  console.log("[auth] set-cookie count:", setCookies.length, setCookies);

  for (const raw of setCookies) {
    const parts = raw.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    // Strip Secure in dev so cookies work over http://localhost
    const opts: Parameters<typeof cookieStore.set>[2] = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    };

    for (const attr of attrs) {
      const lower = attr.toLowerCase();
      if (lower.startsWith("max-age="))
        opts.maxAge = parseInt(attr.split("=")[1], 10);
      else if (lower.startsWith("path="))
        opts.path = attr.split("=")[1].trim();
      else if (lower.startsWith("expires=")) {
        const d = new Date(attr.split("=").slice(1).join("=").trim());
        if (!isNaN(d.getTime())) opts.expires = d;
      }
    }

    console.log("[auth] setting cookie:", name, "=", value.slice(0, 20) + "...");
    cookieStore.set(name, value, opts);
  }

  return { ok: res.ok, status: res.status, data };
}

// ─── Guest Session ─────────────────────────────────────────────────────────────

export async function guestSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE)?.value ?? null;
}

export async function createGuestSession(): Promise<string> {
  if (!db) throw new Error("Database not available");
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.insert(guest).values({ sessionToken: token, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE, token, COOKIE_OPTIONS);
  return token;
}

async function clearGuestSession(token: string): Promise<void> {
  if (!db) return;
  await db.delete(guest).where(eq(guest.sessionToken, token));
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE);
}

// ─── Cart Migration ────────────────────────────────────────────────────────────

export async function mergeGuestCartWithUserCart(
  guestToken: string,
  userId: string
): Promise<void> {
  if (!db) return;
  // TODO: migrate cart rows when cart table is added
  await clearGuestSession(guestToken);
  console.log(`[auth] Merged guest cart (${guestToken}) → user (${userId})`);
}

// ─── Sign Up ───────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const { ok, status, data } = await callAuthAPI("/sign-up/email", {
    name,
    email,
    password,
  });

  if (!ok) {
    const msg = (data.message as string) ?? "Sign up failed.";
    if (status === 409 || msg.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists." };
    }
    return { error: msg };
  }

  const userId = (data.user as { id?: string } | undefined)?.id;
  if (userId) {
    const guestToken = await guestSession();
    if (guestToken) await mergeGuestCartWithUserCart(guestToken, userId);
  }

  return { success: true };
}

// ─── Sign In ───────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const { ok, data } = await callAuthAPI("/sign-in/email", { email, password });

  if (!ok) {
    return { error: "Invalid email or password." };
  }

  const userId = (data.user as { id?: string } | undefined)?.id;
  if (userId) {
    const guestToken = await guestSession();
    if (guestToken) await mergeGuestCartWithUserCart(guestToken, userId);
  }

  return { success: true };
}

// ─── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOut() {
  await callAuthAPI("/sign-out", {}).catch(() => null);

  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  cookieStore.delete("better-auth.session_token");

  redirect("/sign-in");
}
