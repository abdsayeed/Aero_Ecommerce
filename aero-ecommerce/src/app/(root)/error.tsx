"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[root error boundary]", error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center bg-[var(--color-light-100)]">
      <AlertTriangle className="w-12 h-12 text-[var(--color-orange)]" />
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
        Something went wrong
      </h1>
      <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)] max-w-sm">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 border border-[var(--color-light-300)] text-[var(--color-dark-900)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-light-200)] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
