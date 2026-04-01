import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rateLimit";

export const dynamic = "force-dynamic";

const handler = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  return handler.GET(req);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/auth\//, "");

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

  return handler.POST(req);
}
