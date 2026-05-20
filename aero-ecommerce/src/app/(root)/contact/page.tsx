import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactClient from "@/components/ContactClient";

export const metadata = {
  title: "Contact Us | Aervyn",
  description: "Get help with your Aervyn order, returns, delivery and more.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <div className="h-16" />
      <Navbar />
      <main className="flex-1">
        <ContactClient />
      </main>
      <Footer />
    </div>
  );
}
