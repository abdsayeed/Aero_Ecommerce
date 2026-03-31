import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";
import { getCart } from "@/lib/actions/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function CartPage() {
  const [cartResult, session] = await Promise.all([
    getCart(),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <CartClient
          initialItems={cartResult?.items ?? []}
          isLoggedIn={!!session?.user}
        />
      </main>
      <Footer />
    </div>
  );
}
