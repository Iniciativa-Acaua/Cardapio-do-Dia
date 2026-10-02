// lib/products.ts
import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1, slug: "pizza-margherita", name: "Pizza Margherita",
    description: "Deliciosa pizza com molho de tomate, mussarela e manjericão fresco.",
    category: "Pizza", price: 29.99, rating: 4.5, image: "/prato.jpg",
    addons: [
      { id: 1, name: "Borda recheada", price: 6 },
      { id: 2, name: "Queijo extra", price: 4 },
    ],
  },
  {
    id: 2, slug: "hamburguer-classico", name: "Hambúrguer Clássico",
    description: "Suculento hambúrguer com queijo, alface, tomate e molho especial.",
    category: "Hambúrguer", price: 19.99, rating: 4.2, image: "/prato.jpg",
    addons: [
      { id: 3, name: "Bacon", price: 5 },
      { id: 4, name: "Queijo extra", price: 3 },
      { id: 5, name: "Ovo", price: 2.5 },
    ],
  },
  {
    id: 3, slug: "sushi-mix", name: "Sushi Mix",
    description: "Seleção de sushi fresco com salmão, atum e camarão.",
    category: "Sushi", price: 39.99, rating: 4.8, image: "/prato.jpg",
    addons: [
      { id: 6, name: "Shoyu extra", price: 1.5 },
      { id: 7, name: "Gengibre extra", price: 1 },
    ],
  },
  {
    id: 4, slug: "salada-caesar", name: "Salada Caesar",
    description: "Salada clássica com alface, frango grelhado, croutons e molho Caesar.",
    category: "Salada", price: 14.99, rating: 4.0, image: "/prato.jpg",
    addons: [
      { id: 8, name: "Frango extra", price: 6 },
      { id: 9, name: "Molho extra", price: 2 },
    ],
  },
];

export const categories = [...new Set(products.map((p) => p.category))];