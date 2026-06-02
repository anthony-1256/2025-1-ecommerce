/* shipping-address.model.ts */
export interface ShippingAddress {
    _id: string;
    user: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;

    isDefault: boolean;
    addressType: 'home' | 'work' | 'other';
}