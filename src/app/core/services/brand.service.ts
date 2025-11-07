import { Injectable } from '@angular/core';
import { Brand } from '../models/brand.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  private readonly LOCAL_STORAGE_KEY = 'app_brands_v1';

  private _brands: Brand[] = [];
  private brandSubject = new BehaviorSubject<Brand[]>([]);
  public brands$ = this.brandSubject.asObservable();

  constructor() {
    this.loadBrandsFromLocalStorage();
  }

  /* Carga inicial desde localStorage */
  private loadBrandsFromLocalStorage(): void {
    const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (stored) {
      this._brands = JSON.parse(stored);
      this.brandSubject.next([...this._brands]);
    }
  }

  /* Persiste cambios en localStorage y notifica a suscriptores */
  private persistBrands(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this._brands));
    this.brandSubject.next([...this._brands]);
  }

  /* Crear una nueva marca */
  addBrand(brand: Omit<Brand, 'idBrand'>): void {
    const newId = this._brands.length ? Math.max(...this._brands.map(b => b.idBrand)) + 1 : 1;
    this._brands.push({ ...brand, idBrand: newId });
    this.persistBrands();
  }

  /* Actualizar marcas */
  updateBrand(updated: Brand): void {
    const index = this._brands.findIndex(b => b.idBrand === updated.idBrand);
    if (index !== -1) {
      this._brands[index] = updated;
      this.persistBrands();
    }
  }

  /* Eliminar marcas */
  deleteBrand(idBrand: number): void {
    this._brands = this._brands.filter(b => b.idBrand !== idBrand);
    this.persistBrands();
  }

  /* Obtener marca por id */
  getBrandById(idBrand: number): Brand | undefined {
    return this._brands.find(b => b.idBrand === idBrand);
  }
}