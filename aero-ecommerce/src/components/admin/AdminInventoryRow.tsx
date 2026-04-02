"use client";

import { useTransition, useState } from "react";
import { updateInventory } from "@/lib/actions/admin";

interface Props {
  variant: {
    id: string;
    sku: string;
    inStock: number;
    lowStockThreshold: number;
    productName: string;
    colorName: string;
    sizeName: string;
  };
}

export default function AdminInventoryRow({ variant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(String(variant.inStock));
  const [currentStock, setCurrentStock] = useState(variant.inStock);
  const [saved, setSaved] = useState(false);

  const isLow = currentStock <= variant.lowStockThreshold;
  const isCritical = currentStock === 0;

  const handleBlur = () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || n === currentStock) return;
    startTransition(async () => {
      await updateInventory(variant.id, n);
      setCurrentStock(n);
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
        <div className="flex flex-col items-end gap-0.5">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={`w-16 h-8 px-2 border text-[length:var(--text-footnote)] focus:outline-none text-center ${
              isCritical
                ? "border-red-500 text-red-600 bg-red-50"
                : isLow
                ? "border-amber-400 text-amber-700 bg-amber-50"
                : "border-[var(--color-light-300)] text-[var(--color-dark-900)]"
            } focus:border-[var(--color-dark-900)]`}
          />
          {isLow && (
            <span className={`text-[10px] font-medium ${isCritical ? "text-red-600" : "text-amber-600"}`}>
              {isCritical ? "Out of stock" : `Low (≤${variant.lowStockThreshold})`}
            </span>
          )}
        </div>
        {saved && <span className="text-[length:var(--text-footnote)] text-[var(--color-green)]">✓</span>}
      </div>
    </div>
  );
}
