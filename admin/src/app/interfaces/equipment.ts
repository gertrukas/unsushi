export interface Equipment {
    _id: string;
    type:string;
    description: string;
    pdf?: string;
    image?: string;
    section?: string;
    created_at?: null | string;
    updated_at?: null | string;
    type2?:string;
    active?: boolean;
    delete?: boolean;
}
