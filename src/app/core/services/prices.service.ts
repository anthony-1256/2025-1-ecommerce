/* src/app/core/services/prices.service.ts */
import { Injectable } from '@angular/core';
import { PriceEntry } from '../models/price.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PricesService {

  /* ***** PROPIEDADES INTERNAS ***** */
  private prices: PriceEntry[] = [];                       /* ar: lista interna de precios y ofertas */
  private pricesSubject = new BehaviorSubject<PriceEntry[]>([]);
  public prices$: Observable<PriceEntry[]> = this.pricesSubject.asObservable();
  /* fin propiedades internas */

  /* ***** CONSTRUCTOR ***** */
  constructor() {
    this.loadPricesFromLocalStorage();
    this.pricesSubject.next(this.prices);    

    window.addEventListener('storage', (event) => {
      if (event.key === 'prices') {
        this.loadPricesFromLocalStorage();
        this.pricesSubject.next(this.prices);
      }
    });
  }
  /* fin constructor */

  /* ***** MÉTODOS DE CARGA ***** */
  /* fn: cargar desde localStorage */
  private loadPricesFromLocalStorage(): void {
    const stored = localStorage.getItem('prices');
    this.prices = stored ? JSON.parse(stored) : [];
  }
  /* fin loadPricesFromLocalStorage */

  /* fn: obtener todos los precios */
  public getAllPrices(): PriceEntry[] {
    return this.prices;    
  }
  /* fin getAllPrices */

  /* fn: precio por producto */
  public getPriceByProduct(idProduct: number): PriceEntry | undefined {
    return this.prices.find(p => p.idProduct === idProduct);
  }
  /* fin getPriceByProduct */
  /* fin métodos de carga */

  /* ***** MÉTODOS DE PERSISTENCIA ***** */
  /* mt: eliminar un producto de la lista */
  public removePrice(idProduct: number): void {
    this.prices = this.prices.filter(p => p.idProduct !== idProduct);
    this.persistPrices();
  }
  /* fin removePrice */

  /* mt: persistir precios en localStorage y emitir cambios */
  private persistPrices(): void {
    localStorage.setItem('prices', JSON.stringify(this.prices));
    this.pricesSubject.next(this.prices);
  }

  /* mt: agregar o actualizar un PriceEntry */
  public addOrUpdatePrice( entry: PriceEntry ): void {
    if (!entry || entry.idProduct == null) return;

  const index = this.prices.findIndex(p => p.idProduct === entry.idProduct);

  // Normalizar valores numéricos válidos
  const base = Number(entry.currentPrice ?? 0);
  const adj = Number(entry.adjustmentValue ?? 0);
  const type: '+' | '-' = entry.adjustmentType ?? '+';

  // Cálculo de precio final simple y claro
  const final =
    adj === 0 ? base :
    type === '-' ? base * (1 - adj / 100) :
    base * (1 + adj / 100);

  const updatedEntry: PriceEntry = {
    ...entry,
    currentPrice: base,
    finalPrice: Number(final.toFixed(2)), // redondeo seguro
    previousPrice: Number(entry.previousPrice ?? base),
    adjustmentValue: adj,
    adjustmentType: type
  };

  if (index !== -1) {
    this.prices[index] = { ...this.prices[index], ...updatedEntry };
  } else {
    this.prices.push(updatedEntry);
  }

  this.persistPrices();
  } /* fin addOrUpdatePrice */

  /* fin persistPrices */
  /* fin métodos de persistencia */

  /* ***** MÉTODOS DE CÁLCULO DE PRECIOS ***** */
  /* mt: obtener precion temporal o final de un producto */
  public getTemporaryPrice(idProduct: number): number {
    const priceEntry = this.getPriceByProduct(idProduct);

    // 🔹 DEBUG: mostrar información para depuración
    console.log(`[DEBUG][getTemporaryPrice] idProduct:`, idProduct);
    console.log(`[DEBUG][getTemporaryPrice] priceEntry:`, priceEntry);

    if (!priceEntry) {
      return 0;
    }

    /* sin ajuste devuelve currentPrice */
    if (!priceEntry.adjustmentType || priceEntry.adjustmentValue === undefined ) {
      return priceEntry.currentPrice ?? 0;
    }

    /* Calculo de precio final segun ajuste */
    if ( priceEntry.adjustmentType === '-' ) {
      return priceEntry.currentPrice * (1 - priceEntry.adjustmentValue / 100);
    } else {
      return priceEntry.currentPrice * (1 + priceEntry.adjustmentValue / 100);
    }    
  }
  /* fin getTemporaryPrice */

  /* fn: obtener precio final */
  public getFinalPrice(idProduct: number): number | undefined {
    if (idProduct == null) return undefined;

    const entry = this.prices.find(p => p.idProduct === idProduct);

    if (!entry) return undefined;

    // Priorizar finalPrice válido, si no currentPrice
    const final =
      entry.finalPrice != null && !isNaN(entry.finalPrice)
        ? entry.finalPrice
        : entry.currentPrice ?? undefined;

    return typeof final === 'number' && !isNaN(final) ? final : undefined;
  } /* fin getFinalPrice */

  /* fn: obtener precio anterior */
  public getPreviousPrice(idProduct: number): number | undefined {
    const entry = this.getPriceByProduct(idProduct);
    return entry?.previousPrice;
  } /* fin getPreviousPrice */

  /* fn: obtener precio base (sin oferta) */
  public getBasePrice(idProduct: number): number | undefined {
    const entry = this.getPriceByProduct(idProduct);
    return entry?.currentPrice;
  }
  /* fin getBasePrice */

  /* fn: funcion gemela para obtener precio anterior */
  public getPrevsPrice(idProduct: number): number | undefined {
    const entry = this.getPriceByProduct(idProduct);
    return entry?.previousPrice;
  } /* fin getPrevsPrice */

  /* mt: getLastPrice */
  public getLastPrice(idProduct: number): number | undefined {
    let entry = this.getPriceByProduct(idProduct);

    // 🔹 Entrada virtual si no existe
    if (!entry) {
      // Se puede tomar el precio base como fallback
      const product = entry ? undefined : undefined; // Solo por consistencia, aquí no tenemos ProductService
      if (!product) return undefined;
      entry = {
        idProduct: idProduct,
        previousPrice: 0,
        currentPrice: 0,
        finalPrice: 0,
        adjustmentType: '+',
        adjustmentValue: 0,
        discountPercentage: 0,
        priceAdjustment: 0
      } as PriceEntry;
    }

    const prev = entry.previousPrice;
    const curr = entry.currentPrice;

    if (prev != null && !isNaN(prev)) return prev;
    if (curr != null && !isNaN(curr)) return curr;

    return undefined;
  } /* fin getLastPrice */

  /* mt: isPercentageDiscount */
  public isPercentageDiscount(idProduct: number): boolean {
    const entry = this.getPriceByProduct(idProduct);

    if (!entry) return false;

    const prev = entry.previousPrice;
    const curr = entry.currentPrice;

    if (prev == null || curr == null || isNaN(prev) || isNaN(curr)) return false;

    return prev > curr;
  } /* fin isPercentageDiscount */

  /* fin métodos de cálculo de precios */

  /* mt: addPrice */
  public addPrice(entry: PriceEntry): void {
    this.prices.push(entry);
    this.persistPrices();
  }
  
} /* fin PricesService */
