"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/wishlist";

interface Props {
  productId: string;
  initialWishlisted: boolean;
}

export default function WishlistButton({ productId, initialWishlisted }: Props) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if ("data" in result) setWishlisted(result.data.wishlisted);
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`w-full h-14 border text-[length:var(--text-body-medium)] font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark-900)] focus-visible:ring-offset-2 disabled:opacity-50 ${
        wishlisted
          ? "border-[var(--color-dark-900)] bg-[var(--color-dark-900)] text-[var(--color-light-100)]"
          : "border-[var(--color-light-300)] text-[var(--color-dark-900)] hover:border-[var(--color-dark-900)]"
      }`}
    >
      <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
      {wishlisted ? "Saved" : "Favourite"}
    </button>
  );
}
