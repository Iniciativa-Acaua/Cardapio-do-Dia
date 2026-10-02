// db/seed-data.ts
type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number; // em reais, convertido para centavos no seed
  rating: number;
  image: string;
  addons?: { name: string; price: number }[];
};

export const seedProducts: SeedProduct[] = [
  { slug: "pizza-margherita", name: "Pizza Margherita", description: "Deliciosa pizza com molho de tomate, mussarela e manjericão fresco.", category: "Pizza", price: 29.99, rating: 4.5, image: "/prato.jpg",
    addons: [{ name: "Borda recheada", price: 6 }, { name: "Queijo extra", price: 4 }] },
  { slug: "hamburguer-classico", name: "Hambúrguer Clássico", description: "Suculento hambúrguer com queijo, alface, tomate e molho especial.", category: "Hambúrguer", price: 19.99, rating: 4.2, image: "/prato.jpg",
    addons: [{ name: "Bacon", price: 5 }, { name: "Queijo extra", price: 3 }, { name: "Ovo", price: 2.5 }] },
  { slug: "sushi-mix", name: "Sushi Mix", description: "Seleção de sushi fresco com salmão, atum e camarão.", category: "Sushi", price: 39.99, rating: 4.8, image: "/prato.jpg",
    addons: [{ name: "Shoyu extra", price: 1.5 }, { name: "Gengibre extra", price: 1 }] },
  { slug: "salada-caesar", name: "Salada Caesar", description: "Salada clássica com alface, frango grelhado, croutons e molho Caesar.", category: "Salada", price: 14.99, rating: 4.0, image: "/prato.jpg",
    addons: [{ name: "Frango extra", price: 6 }, { name: "Molho extra", price: 2 }] },
];