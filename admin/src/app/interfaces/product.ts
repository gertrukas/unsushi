import { Category } from "./category";

export interface Product {
  _id: string;  // ID del producto
  model: string;
  key: string;
  is_new: boolean;
  dimensions: string;
  categories: Category[];
  default_language: string;
  images: [];
  translations: ProductTranslation[];
  created_at?: null | string;
  updated_at?: null | string;
  image?: null | string;
  is_active?: boolean;
  is_delete?: boolean;
}


export interface ProductTranslation {
  _id?: string;
  product_id: string;
  language: string;
  name: string;
  slug?: string;
  description: string;
  intro: string;
  section: string;
}
