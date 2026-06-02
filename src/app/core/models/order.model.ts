/* order.model.ts */
export interface Order {
    _id: string;
    user: string;
    products: OrderItem[];
    shippingAddress: string;
    paymentMethod: string;
    shippingCost: number;
    totalPrice: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}