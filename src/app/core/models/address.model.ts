/* address.model.ts */
export interface Address {

    _id: string;

    user?: string;

    street: string;
    number: string;

    neighborhood: string;
    postalCode: string;
    municipality: string;

    city: string;
    state: string;

    references?: string;

    phone?: string;
    cellPhone?: string;

    isDefault?: boolean;
    isActive?: boolean;

    createdAt?: string;
    updatedAt?: string;
}

/* ob: agrupador de direcciones por usuario */
export interface UserAddressEntry {
    user: string;
    addresses: Address[];
}

export interface AddressCatalog {
    postalCode: string;
    neighborhood: string;
    municipality: string;
    state: string;
    city: string;
}