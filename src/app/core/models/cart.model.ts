/* cart.model.ts */
import { Product } from "./product.model";
import { User } from "./user.model";

/* ob: Ítem individual del carrito */
export interface CartItem {

    product: Product;
    quantity: number;

}

/* ob: Carrito de compras */
export interface Cart {

    _id: string;
    items: CartItem[];
    user?: User;

    totalQuantity: number;
    totalPrice: number;
    
}