import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { User, ShoppingBag, Heart } from "lucide-react";

const accountNav = [
  { label: "Orders", href: "/account/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Profile", href: "/account/profile", icon: User },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-48 shrink-0">
            <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] uppercase tracking-widest mb-4">
              My Account
            </p>
            <nav className="flex flex-row md:flex-col gap-1">
              {accountNav.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 text-[length:var(--text-caption)] font-medium text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
