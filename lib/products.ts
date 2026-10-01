// lib/products.ts
import type { Product } from "@/types/product";

export const products: Product[] = [
  { id: 1, name: "Pizza Margherita", description: "Deliciosa pizza com molho de tomate, mussarela e manjericão fresco.", category: "Pizza", price: 29.99, rating: 4.5, image: "/prato.jpg" },
  { id: 2, name: "Hambúrguer Clássico", description: "Suculento hambúrguer com queijo, alface, tomate e molho especial.", category: "Hambúrguer", price: 19.99, rating: 4.2, image: "/prato.jpg" },
  { id: 3, name: "Sushi Mix", description: "Seleção de sushi fresco com salmão, atum e camarão.", category: "Sushi", price: 39.99, rating: 4.8, image: "/prato.jpg" },
  { id: 4, name: "Salada Caesar", description: "Salada clássica com alface, frango grelhado, croutons e molho Caesar.", category: "Salada", price: 14.99, rating: 4.0, image: "/prato.jpg" },
];

export const categories = [...new Set(products.map((p) => p.category))];