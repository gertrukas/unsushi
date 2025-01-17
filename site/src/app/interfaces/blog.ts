export interface Blog {
    _id: string;
    author: number;
    name: string;
    slug: string;
    intro: string;
    description: string;
    images: [];
    date:  Date;
    post_type: string;
    active: boolean;
    delete: boolean;
    image: string;
}
