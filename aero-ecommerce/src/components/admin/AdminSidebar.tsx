"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Star,
  CreditCard,
  Settings,
  HelpCircle,
  UserCog,
  LogOut,
  Zap,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

const GENERAL_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products",  icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews",   href: "/admin/reviews",   icon: Star },
  { label: "Orders",    href: "/admin/orders",    icon: CreditCard },
  { label: "Integrations", href: "/admin/integrations", icon: Zap },
];

const ACCOUNT_NAV = [
  { label: "Settings",     href: "/admin/settings",  icon: Settings },
  { label: "Help",         href: "/contact",          icon: HelpCircle },
  { label: "Manage Users", href: "/admin/customers",  icon: UserCog },
];

interface Props {
  user: { name: string; email: string; image: string | null };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-56 shrink-0 bg-[#1a1d23] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
          <Image src="/IMG_7194.PNG" alt="Aero" width={22} height={22} className="object-contain brightness-0 invert" style={{ width: "auto", height: "18px" }} />
        </div>
        <span className="text-white font-bold text-base tracking-tight">Aero Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        {/* General section */}
        <div>
          <p className="px-5 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">General</p>
          <nav className="flex flex-col gap-0.5 px-3">
            {GENERAL_NAV.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account section */}
        <div>
          <p className="px-5 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Account</p>
          <nav className="flex flex-col gap-0.5 px-3">
            {ACCOUNT_NAV.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
