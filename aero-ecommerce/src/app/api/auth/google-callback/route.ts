import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mergeGuestCartWithUserCart } from "@/lib/auth/actions";

// This route is hit after Google OAuth completes when a guest token is present.
// Better Auth handles the actual OAuth flow; this just merges the guest cart.
export async function GET(req: NextRequest) {
  const guestToken = req.nextUrl.searchParams.get("guest");

  if (guestToken) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        await mergeGuestCartWithUserCart(guestToken, session.user.id);
      }
    } catch (e) {
      console.error("[google-callback] cart merge error:", e);
    }
  }

  return NextResponse.redirect(new URL("/", req.url));
}
