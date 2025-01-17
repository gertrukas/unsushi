import { Category } from "./category";

export interface Tag {
    _id: string;
    name:string;
    slug:string;
    description: string;
    parent: string;
    image: string;
    images: [];
    categories: [Category]
    active: boolean;
    delete: boolean;
}
