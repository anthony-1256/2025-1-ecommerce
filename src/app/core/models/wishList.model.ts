/* wishList.model.ts */
export interface Wishlist {
    _id: string;
    user: string;
    products: WishListProduct[];
    createdAt?: string;
    updatedAt?: string;    
}

export interface WishListProduct {
    product: string;
    addedAt: string;
    tags?: string[];
}