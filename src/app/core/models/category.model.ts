/* category.model.ts */
export interface Category {
    _id: string,
    name: string;
    description: string;
    imageURL: string;
    parentCategory: Category | null;
}