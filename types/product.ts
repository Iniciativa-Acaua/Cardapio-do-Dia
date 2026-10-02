// types/product.ts
export type Addon = {
  id: number;
  name: string;
  price: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  addons?: Addon[];
};