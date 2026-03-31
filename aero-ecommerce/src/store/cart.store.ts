"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartLineItem = {
  /** cart_items.id */
  cartItemId: string;
  /** product_variants.id */
  variantId: string;
  /** products.id */
  productId: string;
  productName: string;
  variantSku: string;
  colorName: string;
  colorHex: string;
  sizeName: string;
  price: string;
  salePrice: string | null;
  image: string | null;
  quantity: number;
  inStock: number;
};

type CartStore = {
  items: CartLineItem[];
  // Hydrate from server (replaces local state)
  setItems: (items: CartLineItem[]) => void;
  // Optimistic updates
  addItem: (item: CartLineItem) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearItems: () => void;
  // Derived
  totalItems: () => number;
  totalPrice: () => number;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity, cartItemId: item.cartItemId }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.cartItemId !== cartItemId)
              : state.items.map((i) =>
                  i.cartItemId === cartItemId ? { ...i, quantity } : i
                ),
        })),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      clearItems: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum +
            parseFloat(i.salePrice ?? i.price) * i.quantity,
          0
        ),
    }),
    {
      name: "aero-cart",
      // Only persist items — derived functions are not serializable
      partialize: (state) => ({ items: state.items }),
    }
  )
);
