"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  /** Optional right-side element (e.g. star rating) */
  aside?: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  aside,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--color-light-300)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] rounded"
        aria-expanded={open}
      >
        <span className="text-[length:var(--text-body-medium)] font-medium text-[var(--color-dark-900)]">
          {title}
        </span>
        <div className="flex items-center gap-3">
          {aside}
          {open ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-dark-700)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-dark-700)]" />
          )}
        </div>
      </button>

      {open && (
        <div className="pb-5 text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
