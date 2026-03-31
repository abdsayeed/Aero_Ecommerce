import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center bg-[var(--color-light-100)]">
      <PackageX className="w-12 h-12 text-[var(--color-dark-500)]" />
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
        Page not found
      </h1>
      <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)] max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
