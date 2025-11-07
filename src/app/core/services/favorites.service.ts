/***** src/app/core/services/favorites.service.ts *****/
/* favoritesService actual */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from './auth.service';
import { Favorite } from '../models/favorites.model';
import { ProductService } from './product.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  /* ***** PROPIEDADES ***** */
  private currentUser: User | null = null;  
  public userFavorites: Favorite[] = [];
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  private storageKey: string = 'favorites';

  /* constructor */
  constructor(
    private authService: AuthService,
    private productService: ProductService,    
  ) {
    this.syncCurrentUser();
    this.reloadFavoritesFromStorage();
  }
  /* fin constructor */

  /* ***** METODOS CRUD ***** */
  /* mt: getAllFavorites */
  public getAllFavorites(userId?: number): Favorite[] {
    
    const stored = localStorage.getItem(this.storageKey);
    this.userFavorites = stored ? JSON.parse(stored) : [];

    const targetUserId = userId ?? this.getCurrentUserId();
    const filtered = targetUserId 
      ? this.userFavorites.filter(fav => fav.idUser === targetUserId)
      : this.userFavorites;

    this.favoritesSubject.next(filtered); // <-- esto hace que enrichedFavorites$ reciba datos

    return filtered;    
  } /* fin getAllFavorites */
  
  /* mt: getFavoritesByUser */
  public getFavoritesByUser(idUser?: number): Favorite[] {

    const currentUserId = idUser ?? this.getCurrentUserId();    
    if (!currentUserId) return [];

    console.log('[FavoritesService] getFavoritesByUser -> currentUserId:', currentUserId);

    const stored = localStorage.getItem(this.storageKey);
    this.userFavorites = stored ? JSON.parse(stored) : [];

    return this.userFavorites.filter(fav => fav.idUser === currentUserId);
  } /* fin getFavoritesByUser */

  /* mt: createFavoritesByUser */
  public createFavoritesByUser(product: Favorite): void {

    const stored = localStorage.getItem(this.storageKey);

    this.userFavorites = stored ? JSON.parse(stored) : [];

    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;

    const currentProduct = this.productService.getProductById(product.idProduct);
    const currentPrice = currentProduct ? currentProduct.price : product.price;

    const index = this.userFavorites.findIndex(
      fav => fav.idProduct === product.idProduct && fav.idUser === currentUserId
    );

    if (index !== -1) {
      this.userFavorites.splice(index, 1);
    } else {
      const updatedFavorite: Favorite = {
        ...product,
        idUser: currentUserId,
        price: currentPrice
      };
      this.userFavorites.push(updatedFavorite);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.userFavorites));

    /* const filtered = this.userFavorites.filter(fav => fav.idUser === currentUserId);
    this.favoritesSubject.next(filtered); */
    this.favoritesSubject.next(this.getFavoritesByUser());
  } /* fin createFavoritesByUser */

  /* mt: updateFavoritesByUser */
  public updateFavoritesByUser(updatedProduct: Favorite): void {

    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;

    const stored = localStorage.getItem(this.storageKey);
    this.userFavorites = stored ? JSON.parse(stored) : [];

    const index = this.userFavorites.findIndex(
      fav => fav.idProduct === updatedProduct.idProduct && fav.idUser === currentUserId
    );

    if (index !== -1) {
      const currentProduct = this.productService.getProductById(updatedProduct.idProduct);
      const currentPrice = currentProduct ? currentProduct.price : updatedProduct.price;

      const updatedFavorite: Favorite = {
        ...updatedProduct,
        idUser: currentUserId,
        price: currentPrice
      };

      this.userFavorites[index] = updatedFavorite;

      localStorage.setItem(this.storageKey, JSON.stringify(this.userFavorites));
      /* this.favoritesSubject.next(this.userFavorites); */
      this.favoritesSubject.next(this.getFavoritesByUser());
    }
  } /* fin updateFavoritesByUser */

  /* mt: deleteFavoritesByUser */
  public deleteFavoritesByUser(idProduct: number): void {

    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;

    const stored = localStorage.getItem(this.storageKey);
    this.userFavorites = stored ? JSON.parse(stored) : [];

    const index = this.userFavorites.findIndex(
      fav => fav.idProduct === idProduct && fav.idUser === currentUserId
    );

    if (index !== -1) {
      this.userFavorites.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(this.userFavorites));
      
      /* this.favoritesSubject.next(this.userFavorites); */
      this.favoritesSubject.next(this.getFavoritesByUser());

      console.log('[FavoritesService] Producto eliminado, favoritos emitidos al observable:', this.userFavorites); /* **** TRY-2 **** */
    }
  } /* fin deleteFavoritesByUser */

  /* mt: deleteAllFavoritesByUser */
  public deleteAllFavoritesByUser(userId?: number): void {

    const targetUserId = userId ?? this.getCurrentUserId();
    if (!targetUserId) return;

    const stored = localStorage.getItem(this.storageKey);
    this.userFavorites = stored ? JSON.parse(stored) : [];

    // Filtramos todos los favoritos que NO pertenecen al usuario
    const updatedFavorites = this.userFavorites.filter(fav => fav.idUser !== targetUserId);

    // Actualizamos la propiedad interna y sincronizamos
    this.userFavorites = updatedFavorites;
    localStorage.setItem(this.storageKey, JSON.stringify(updatedFavorites));
    
    /* this.favoritesSubject.next(updatedFavorites); */
    this.favoritesSubject.next(this.getFavoritesByUser());

    console.log('[FavoritesService] Todos los favoritos del usuario eliminados:', updatedFavorites); /* **** TRY-2 **** */
  } /* fin deleteAllFavoritesByUser */
  
  /***** MÉTODOS DE SINCRONIZACIÓN DE FAVORITOS / STREAMS OBSERVABLES *****/
  /* mt: reloadFavoritesFromStorage */
  public reloadFavoritesFromStorage(): void {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;
    
    const storedData = localStorage.getItem(this.storageKey);
    if (!storedData) return;
    
    try {
      const parsed: Favorite[] = JSON.parse(storedData);
      if (!Array.isArray(parsed)) return;

      const userFavorites = parsed.filter(fav => fav.idUser === currentUserId);
      const isDifferent = JSON.stringify(this.userFavorites) !== JSON.stringify(userFavorites);      

      if (isDifferent) {
        this.userFavorites = [...userFavorites];
        this.favoritesSubject.next(this.userFavorites);
      }
    } catch (error) {
      console.error('Error al recargar favoritos desde localStorage', error);
    }
  } /* fin reloadFavoritesFromStorage */

  /* mt: updateFavoritesStream
    emite directamente un arreglo de favoritos sin tocar localStorage */
  public updateFavoritesStream(favorites: Favorite[]): void {
    this.userFavorites = favorites;
    this.favoritesSubject.next(favorites);
  } /* fin updateFavoritesStream */

  /* ***** METODOS AUXILIARES ***** */
  /* mt: syncCurrentUser */
  private syncCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser() ?? null;
  } /* fin syncCurrentUser */

  /* mt: getCurrentUser */
  public getCurrentUserId(): number | null {
    return this.currentUser?.idUser ?? null;
  } /* fin getCurrentUser */

  /* mt: getStorageKey */
  public getStorageKey(): string {
    return this.storageKey;
  } /* fin getStorageKey */
  
  /* mt: isFavorite */
  public isFavorite(idProduct: number): boolean {
    const currentFavorites = this.favoritesSubject.value;
    return currentFavorites.some(f => f.idProduct === idProduct);
  }

  
} /* fin favoritesService */

/*
  CanActivate

  */