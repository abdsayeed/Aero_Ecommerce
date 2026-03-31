import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user?.id) redirect("/sign-in");

  if (db) {
    const rows = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1);
    if (!rows.length || rows[0].role !== "admin") redirect("/");
  }

  const adminUser = {
    name: session.user.name ?? "Admin",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">
      <AdminSidebar user={adminUser} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-gray-100 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {adminUser.image ? (
                <Image src={adminUser.image} alt={adminUser.name} width={36} height={36} className="object-cover" />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {adminUser.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
