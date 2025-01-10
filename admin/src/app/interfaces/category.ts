export interface Category {
    _id: string;
    is_new?: boolean;
    translations: CategoryTranslation[];
    default_language: string;
    created_at?: null | string;
    updated_at?: null | string;
    image?: null | string;
    is_active?: boolean;
    is_delete?: boolean;
}


export interface CategoryTranslation {
    _id?: string;
    category_id: string;
    language: string;
    name: string;
    slug?: string;
    description: string;
    intro: string;
    section: string;
}