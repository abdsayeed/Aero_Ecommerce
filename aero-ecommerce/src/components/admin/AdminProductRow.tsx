"use client";

import { useTransition } from "react";
import { toggleProductPublished } from "@/lib/actions/admin";

interface Props {
  product: {
    id: string;
    name: string;
    isPublished: boolean;
    createdAt: Date;
    categoryName: string;
    brandName: string;
  };
}

export default function AdminProductRow({ product }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductPublished(product.id);
    });
  };

  return (
    <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] last:border-0 items-center transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] truncate">{product.name}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">{product.brandName}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">{product.categoryName}</span>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`text-[length:var(--text-footnote)] font-medium px-3 py-1 transition-colors ${
          product.isPublished
            ? "bg-green-50 text-[var(--color-green)] hover:bg-red-50 hover:text-[var(--color-red)]"
            : "bg-[var(--color-light-200)] text-[var(--color-dark-500)] hover:bg-green-50 hover:text-[var(--color-green)]"
        }`}
      >
        {product.isPublished ? "Published" : "Draft"}
      </button>
    </div>
  );
}
