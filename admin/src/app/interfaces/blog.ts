export interface Blog {
    _id: string;
    image: string;
    default_language: string;
    translations?: BlogTranslation[];
    images?: [];
    created_at?: Date;
    is_delete?: boolean;
    is_active?: boolean;
}

export interface BlogTranslation {
    _id?: string;
    blog_id: string;
    language: string;
    name: string;
    slug?: string;
    description: string;
    intro: string;
  }