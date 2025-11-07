/***** src/app/core/models/address.model.ts *****/
export interface Address {

    street: string;
    number: string;
    neighborhood: string;
    postalCode: string;
    city: string;
    state: string;
    phone: string;
    cellPhone: string;
    
    isDefault: boolean;

}

/* ob: agrupador de direcciones por usuario */
export interface UserAddressEntry {
    idUser: number;
    addresses: Address[];
}