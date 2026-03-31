import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rateLimit";

export const dynamic = "force-dynamic";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth);

// Rate-limit sign-in and sign-up endpoints: 10 attempts per IP per minute
export async function GET(req: NextRequest, ctx: { params: Promise<{ all: string[] }> }) {
  return authGET(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ all: string[] }> }) {
  const { all } = await ctx.params;
  const path = all?.join("/") ?? "";

  if (path === "sign-in/email" || path === "sign-up/email") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { allowed } = checkRateLimit(`auth:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }
  }

  return authPOST(req, ctx);
}
