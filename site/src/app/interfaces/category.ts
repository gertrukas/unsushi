export interface Category {
    _id: string;
  name:string;
  slug:string;
  description: string;
  parent: string;
  image: string;
  images: [];
  childrens: [];
  active: boolean;
  delete: boolean;
}
