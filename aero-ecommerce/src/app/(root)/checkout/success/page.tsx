import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderSuccess from "@/components/OrderSuccess";
import { stripe } from "@/lib/stripe/client";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/");

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "customer_details"],
    });
  } catch {
    redirect("/");
  }

  if (session.payment_status !== "paid") redirect("/cart");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <OrderSuccess session={session} />
      </main>
      <Footer />
    </div>
  );
}
