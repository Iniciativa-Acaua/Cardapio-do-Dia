import { create } from "zustand";
import type { Product } from "@/types/product";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Pick<Product, "id" | "name" | "price" | "image">) => void;
  removeItem: (id: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));