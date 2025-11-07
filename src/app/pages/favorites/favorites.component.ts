/***** src/app/pages/favorites/favorites.component.ts *****/
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map, Observable, of, Subscription } from 'rxjs';
import { FavoritesService } from '../../core/services/favorites.service';
import { Favorite } from '../../core/models/favorites.model';
import Swal from 'sweetalert2';
import { PricesService } from '../../core/services/prices.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit, OnDestroy {

  /* ***** PROPIEDADES DE FAVORITOS ***** */
  favorites$!: Observable<Favorite[]>;
  private favoriteIds: Set<number> = new Set();  
  private storageListener!: (event: StorageEvent) => void;

  hover: number | null = null;

  /* ***** FLAGS DE UI / ESTADO ***** */
  isLoading: boolean = false;
  

  /* ***** CONSTRUCTOR ***** */
  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private pricesService: PricesService
  ) {}
  /* fin constructor */


  /* ***** METODOS: CICLO DE VIDA ***** */
  /* ngOnInit */
  ngOnInit(): void {
    this.isLoading = true;

    const currentUserId = this.favoritesService.getCurrentUserId();
    if (!currentUserId) {
      this.favorites$ = of([]);
      setTimeout(() => { this.isLoading = false; }, 500);
      return;
    }

    // 1️⃣ Inicializar favoritos desde el servicio
    this.favoritesService.getAllFavorites();

    // 2️⃣ Suscribirse al BehaviorSubject de favoritos
    this.favorites$ = this.favoritesService.favorites$;
    this.favorites$.subscribe(favs => {
      this.favoriteIds.clear();
      favs.forEach(fav => this.favoriteIds.add(fav.idProduct));
    });

    // 3️⃣ Listener opcional para cambios externos en localStorage
    this.storageListener = (event: StorageEvent) => {
      if (event.key === this.favoritesService.getStorageKey()) {
        this.favoritesService.reloadFavoritesFromStorage();
      }
    };
    window.addEventListener('storage', this.storageListener);

    setTimeout(() => { this.isLoading = false; }, 500);
  } /* fin ngOnInit */


  /* ngOnDestroy */
  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  } /* fin ngOnDestroy */
  
  
  /* ***** METODOS DE FAVORITOS ***** */
  /* mt: deleteAllFavoritesByUser */
  public deleteAllFavoritesByUser(): void {    
    const currentUserId = this.favoritesService.getCurrentUserId();
    if (!currentUserId) return;

    Swal.fire({
      title: '¿Deseas eliminar todos tus favoritos?',
      text: 'Esta acción eliminará todos tus productos favoritos. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar todos',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.favoritesService.deleteAllFavoritesByUser();
        
        Swal.fire({
          title: 'Favoritos eliminados',
          text: 'Todos tus favoritos han sido eliminados correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  } /* fin deleteAllFavoritesByUser */

  /* mt: deleteFavoritesByUser */
  public deleteFavoriteByUser(fav: Favorite): void {
    const currentUserId = this.favoritesService.getCurrentUserId();
    if (!currentUserId) return;

    Swal.fire({
      title: '¿Queres seguir?',
      text: `¿Deseas eliminar ${fav.name} de tus favoritos?`,
      icon : 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.favoritesService.deleteFavoritesByUser(fav.idProduct);
              
        Swal.fire({
          title: 'Producto eliminado',
          text: 'Si deseas, podrás volver a agregar este producto más adelante.',
          icon: 'info',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  } /* fin deleteFavoriteByUser */


  onRemoveFavorite(fav: Favorite) {
    this.favoritesService.deleteFavoritesByUser(fav.idProduct);
  }


  /* mt: onViewDetails */
  public onViewDetails(fav: Favorite): void {
    const currentUserId = this.favoritesService.getCurrentUserId();
    if (!currentUserId) return;

    this.router.navigate(['/detalles', fav.idProduct]);
  } /* fin onViewDetails */

  /* mt: enrichedFavorites$ - favoritos enriquecidos con lastPrice y hasDiscount */
  public get enrichedFavorites$(): Observable<(Favorite & { lastPrice?: number; hasDiscount?: boolean })[]> {
    return this.favorites$.pipe(
      map(favs => favs.map(fav => {
        const lastPrice = this.pricesService.getLastPrice(fav.idProduct);
        const hasDiscount = lastPrice !== undefined && lastPrice > fav.price;
        return { ...fav, lastPrice, hasDiscount };
      }))
    );
  } /* fin enrichedFavorites$ */


  /* mt: onCardHover */
/*   public onCardHover(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    el.style.transform = 'scale(1.03)';
    el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
  } */ /* fin onCardHover */

  /* mt: onCardLeave */
/*   public onCardLeave(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    el.style.transform = 'scale(1)';
    el.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,0.075)';
  } */ /* fin onCardLeave */

} /* fin FavoritesComponent */