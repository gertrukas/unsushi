import { Category } from "./category";

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    intro: string;
    date: Date;
    model: string;
    key: string;
    new: string;
    size: string;
    translations: [Translation];
    categories: [Category];
    image: string;
    images: [];
    active: boolean;
    delete: boolean;
}

interface Translation {
    product: string;
    language: string;
    name: string;
    slug: string;
    intro: string;
    description: string;
}
