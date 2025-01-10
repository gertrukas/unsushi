import { Category } from "./category";

export interface Tag {
    _id: string;
    parent: string;
    image: string;
    images: [];
    default_language: string;
    translations: TagTranslation[];
    categories: Category[]
    is_active?: boolean;
    is_delete?: boolean;
}

export interface TagTranslation {
    _id?: string;
    tag_id: string;
    language: string;
    name: string;
    slug?: string;
    description: string;
    intro: string;
  }
