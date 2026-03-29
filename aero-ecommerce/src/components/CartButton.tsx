"use client";

import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
    const totalItems = useCartStore((state) => state.totalItems);
    const totalPrice = useCartStore((state) => state.totalPrice);

    return (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">
                {totalItems()} items · ${totalPrice().toFixed(2)}
            </span>
        </div>
    );
}
