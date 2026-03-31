"use client";

import { useTransition, useState } from "react";
import { updateInventory } from "@/lib/actions/admin";

interface Props {
  variant: {
    id: string;
    sku: string;
    inStock: number;
    productName: string;
    colorName: string;
    sizeName: string;
  };
}

export default function AdminInventoryRow({ variant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(String(variant.inStock));
  const [saved, setSaved] = useState(false);

  const handleBlur = () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || n === variant.inStock) return;
    startTransition(async () => {
      await updateInventory(variant.id, n);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] last:border-0 items-center transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] truncate">{variant.productName}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] font-mono">{variant.sku}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">{variant.colorName}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">{variant.sizeName}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="w-16 h-8 px-2 border border-[var(--color-light-300)] text-[length:var(--text-footnote)] text-[var(--color-dark-900)] focus:outline-none focus:border-[var(--color-dark-900)] text-center"
        />
        {saved && <span className="text-[length:var(--text-footnote)] text-[var(--color-green)]">✓</span>}
      </div>
    </div>
  );
}
