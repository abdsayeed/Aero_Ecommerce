"use client";

import { Product } from "@/db/schema";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
            {/* Image */}
            <div className="relative h-56 bg-gray-50 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {product.category}
                </span>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {product.brand}
                </p>
                <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">
                    {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-extrabold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${added
                                ? "bg-green-500 text-white scale-95"
                                : "bg-black text-white hover:bg-gray-800 active:scale-95"
                            }`}
                    >
                        {added ? "✓ Added!" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
}
