// types/product.ts
export type Addon = {
  id: string;
  name: string;
  priceCents: number;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  priceCents: number;
  ratingAvg: number;
  ratingCount: number;
  imageUrl: string;
};

export type ProductDetail = ProductSummary & { addons: Addon[] };