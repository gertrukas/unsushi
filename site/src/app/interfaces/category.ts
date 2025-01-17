export interface Category {
  _id: string;
  translations: [Translation];
  parent: string;
  image: string;
  images: [];
  childrens: [];
  active: boolean;
  delete: boolean;
}

interface Translation {
  category: string;
  language: string;
  name: string;
  slug: string;
  intro: string;
  description: string;
}