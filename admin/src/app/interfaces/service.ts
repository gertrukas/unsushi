import { Category } from "./category";

export interface ServiceI {
    _id: string;
    type: string;
    slug?: null | string;
    description?: null | string;
    include?: null | string;
    category?: Category;
    created_at?: null | string;
    updated_at?: null | string;
    image: string;
    home?: null | boolean;
    active?: null | boolean;
    delete?: null | boolean;
}
