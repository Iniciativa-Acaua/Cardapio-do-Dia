// lib/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddon = { id: string; name: string; priceCents: number };

export type CartItem = {
  key: string; // prato + adicionais
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  addons: CartAddon[];
  unitPriceCents: number; // já com os adicionais
  quantity: number;
};

type NewItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
};

type CartState = {
  items: CartItem[];
  addItem: (product: NewItem, addons?: CartAddon[]) => void;
  increase: (key: string) => void;
  decrease: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const makeKey = (id: string, addons: CartAddon[]) =>
  [id, ...addons.map((a) => a.id).sort()].join("|");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, addons = []) =>
        set((state) => {
          const key = makeKey(product.id, addons);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
                addons,
                unitPriceCents:
                  product.priceCents + addons.reduce((sum, a) => sum + a.priceCents, 0),
                quantity: 1,
              },
            ],
          };
        }),
      increase: (key) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),
      decrease: (key) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "mais-sabor-cart-v3", skipHydration: true }
  )
);