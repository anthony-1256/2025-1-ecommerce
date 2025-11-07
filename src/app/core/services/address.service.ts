/***** src/app/core/services/address.service.ts *****/
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Address, UserAddressEntry } from '../models/address.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  /* ar: lista interna de direcciones agrupadas por usuario */
  private userAddresses: UserAddressEntry[] = [];

  /* ob: observable reactivo para las direcciones de todos los usuarios */
  private addressesSubject = new BehaviorSubject<UserAddressEntry[]>([]);
  public addresses$: Observable<UserAddressEntry[]> = this.addressesSubject.asObservable();

  constructor(
    private authService: AuthService
  ) {
    this.loadAddressesFromLocalStorage();
  }

  /* mt: cargar direcciones desde localStorage */
  private loadAddressesFromLocalStorage(): void {
    const stored = localStorage.getItem('userAddresses');
    this.userAddresses = stored ? JSON.parse(stored) : [];
    this.addressesSubject.next(this.userAddresses);
  }

  /* mt: cargar direcciones desde localStorage */
  private saveAddressesToLocalStorage(): void {
    localStorage.setItem('userAddresses', JSON.stringify(this.userAddresses));
    this.addressesSubject.next(this.userAddresses);
  }

  /* fn: obtener todas las direcciones de un usuario */
  public getAddressesByUser(idUser: number): Address[] {
    const entry = this.userAddresses.find(entry => entry.idUser === idUser);
    return entry ? entry.addresses: [];
  }

  /*  */
  public getDefaultAddressByUser(idUser: number): Address | null {
    
    /* 🔧 busca las direcciones del usuario */
    const entry = this.userAddresses.find(e => e.idUser === idUser);
    
    /* 🔧 si no hay direcciones devuelve null */
    if (!entry || !entry.addresses.length) return null;
    
    /* 🔧 busca la que está marcada como default */
    const defaultAddress = entry.addresses.find(a => a.isDefault);
    
    /* 🔧 si no hay default, retorna la primera */
    return defaultAddress || entry.addresses[0];
  }

  
  /* mt: agregar una direccion a un usuario */
  public addAddressForUser(idUser: number, address: Address): void {
    const entry = this.userAddresses.find(entry => entry.idUser === idUser);

    if ( !entry || !entry.addresses.length ) {
      ( address as any).isDefault = true;
    }

    if ( entry ) {
      entry.addresses.push(address);

    } else {
      this.userAddresses.push({
        idUser: idUser,
        addresses: [address]
      });
    }

    this.saveAddressesToLocalStorage();    
  }

  /*  */
  public getAddressesByCurrentUser(): Observable<Address[]> {
    const currentUserId = this.authService.getCurrentUser()?.idUser;
    if (!currentUserId) {
      return of([]);
    }
    return this.addresses$.pipe(
      map(userEntries => {
        const entry = userEntries.find(e => e.idUser === currentUserId);
        return entry ? entry.addresses : [];
      })
    );
  }


  /* mt: eliminar una direccion de un usuario por indice */
  public deleteAddressForUser(idUser: number, index: number): void {
    const entry = this.userAddresses.find(entry => entry.idUser === idUser);

    if (entry && entry.addresses[index]) {
      entry.addresses.splice(index, 1);
      this.saveAddressesToLocalStorage();
    }
  }

  /* mt: actualizar una direccion existente */
  public updateAddressForUser(idUSer: number, index: number, updatedAddress: Address): void {
    const entry = this.userAddresses.find(entry => entry.idUser === idUSer);

    if (entry && entry.addresses[index]) {
      entry.addresses[index] = updatedAddress;
      this.saveAddressesToLocalStorage();
    }
  }

}