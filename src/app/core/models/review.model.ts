/* review.model.ts */
export interface Review {
    _id: string;
    user: string;
    product: string;
    rating: number;
    comment?: string;
}