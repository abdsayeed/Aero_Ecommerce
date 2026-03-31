"use client";

import { useState, useTransition } from "react";
import { Ruler, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { addCartItem } from "@/lib/actions/cart";

export type SizeOption = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  inStock: number;
};

interface SizePickerDBProps {
  sizes: SizeOption[];
  /** variantId per size — maps sizeId → variantId */
  variantIdBySizeId: Record<string, string>;
}

export default function SizePickerDB({ sizes, variantIdBySizeId }: SizePickerDBProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setItems } = useCartStore();

  const handleAddToBag = () => {
    if (!selectedSizeId) return;
    const variantId = variantIdBySizeId[selectedSizeId];
    if (!variantId) return;

    startTransition(async () => {
      const result = await addCartItem(variantId, 1);
      if (result) {
        setItems(result.items);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  return (
    <div>
      {/* Size header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">
          Select Size
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-[length:var(--text-footnote)] text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors focus:outline-none focus-visible:underline"
        >
          <Ruler className="w-3.5 h-3.5" />
          Size Guide
        </button>
      </div>

      {/* Size grid */}
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Select a size">
        {sizes.map((size) => {
          const oos = size.inStock === 0;
          const isSelected = selectedSizeId === size.id;

          return (
            <button
              key={size.id}
              type="button"
              disabled={oos}
              onClick={() => !oos && setSelectedSizeId(size.id)}
              aria-pressed={isSelected}
              aria-label={`Size ${size.name}${oos ? " — out of stock" : ""}`}
              className={`
                relative h-10 text-[length:var(--text-footnote)] font-medium border transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)]
                ${oos
                  ? "border-[var(--color-light-300)] text-[var(--color-light-400)] cursor-not-allowed"
                  : isSelected
                  ? "border-[var(--color-dark-900)] bg-[var(--color-dark-900)] text-[var(--color-light-100)]"
                  : "border-[var(--color-light-300)] text-[var(--color-dark-900)] hover:border-[var(--color-dark-900)]"
                }
              `}
            >
              {size.name}
              {oos && (
                <span className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                  <span className="absolute top-1/2 left-0 w-full h-px bg-[var(--color-light-400)] rotate-[-20deg] origin-center" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add to Bag button */}
      <button
        type="button"
        onClick={handleAddToBag}
        disabled={!selectedSizeId || isPending}
        className={`
          mt-6 w-full h-14 text-[length:var(--text-body-medium)] font-medium flex items-center justify-center gap-2
          transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2
          ${!selectedSizeId
            ? "bg-[var(--color-light-300)] text-[var(--color-dark-500)] cursor-not-allowed"
            : added
            ? "bg-[var(--color-green)] text-white"
            : "bg-[var(--color-dark-900)] text-[var(--color-light-100)] hover:bg-[var(--color-dark-700)]"
          }
        `}
        aria-label={!selectedSizeId ? "Select a size first" : "Add to Bag"}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" />
            Added to Bag
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            {!selectedSizeId ? "Select a Size" : isPending ? "Adding..." : "Add to Bag"}
          </>
        )}
      </button>
    </div>
  );
}
