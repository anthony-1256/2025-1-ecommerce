/* src/app/features/prices/prices.component.ts */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { PricesService } from '../../core/services/prices.service';
import { PriceEntry } from '../../core/models/price.model';

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prices.component.html',
  styleUrl: './prices.component.css',
})
export class PricesComponent implements OnInit {

  /* Observable del inventario real */
  public products$: Observable<Product[]>;
  public products: Product[] = [];

  constructor(
    private productService: ProductService,
    private pricesService: PricesService
  ) {
    this.products$ = this.productService.products$;    
  }

  ngOnInit(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
    })
  }
  
  /* fn: obtener nombre del producto */
  public getDisplayName(product: Product): string {
    return product.productName;
  }
  
  /* fn: obtener stock disponible */
  public getStock(product: Product): number {
    return product.quantity;
  }

  /* ar: precios temporales por producto (solo para mostrar en la columna "Ajuste temporal") */
  public priceTemporary: { [idProduct: number]: number | null } = {};
  public activeAdjustment: { [idProduct: number]: 'percentage' | 'direct' } = {};
  
  public percentageTemporary: { [id: number]: number | null } = {};

  /* ar: productos en modo edición */
  public editMode: { [idProduct: number]: boolean } = {};

  /* mt: calcular descuento por porcentaje y actualizar precio temporal */
  public calculatePercentageDiscount(idProduct: number, percentage: number): void {
    if (percentage < 0) percentage = 0;       // no permitir negativos
    if (percentage > 100) percentage = 100;   // máximo 100%    

    const product = this.productService.getProductById(idProduct);
    if (!product) return;

    const basePrice = product.price;
    const discountAmount = basePrice * (percentage / 100);

    /* Solo actualizar priceTemporary si el ajuste activo es porcentaje */
    /* this.priceTemporary[idProduct] = basePrice - discountAmount; */
    if (this.getActiveAdjustment(idProduct) === 'percentage') {
      this.priceTemporary[idProduct] = basePrice -discountAmount;
    }
  }

  /* mt: aplicar ajuste directo en precio y actualizar precio temporal */
  public applyDirectPrice(idProduct: number, directPrice: number): void {
    if (directPrice < 0) directPrice = 0; // no permitir precio negativo

    const product = this.productService.getProductById(idProduct);
    if (!product) return;

    if (this.getActiveAdjustment(idProduct) === 'direct') {
      this.priceTemporary[idProduct] = directPrice;
    }
  }

  /* fn: obtener el ajuste activo de un producto (porcentaje o precio directo) */
  public getActiveAdjustment(idProduct: number): 'percentage' | 'direct' {
    // Si no hay valor definido, se asume porcentaje por defecto
    return this.activeAdjustment[idProduct] ?? 'percentage';
  }

  /* Ajuste activo de productos */
  public toggleAdjustment(idProduct: number, adjustment: 'percentage' | 'direct'): void {
    this.activeAdjustment[idProduct] = adjustment;

    /* Opcional: limpiar la columna desactivada */
    if (adjustment === 'percentage') {
      this.activeAdjustment[idProduct] = adjustment;
    } else {
      this.priceTemporary[idProduct] = null;
    }
  }

  /* mt: activar modo edición para un producto */
  public enableEditMode(idProduct: number): void{
    this.editMode[idProduct] = true;
  }

  /* fn: saveEdit */
  public saveEdit(idProduct: number): void {    
    const product = this.productService.getProductById(idProduct);
    if (!product) return;    
    const newPrice = this.priceTemporary[idProduct];

    if (newPrice != null) {
      // 🔹 Eliminada la referencia a pricesService.setPrice
      // Ahora solo actualizamos el producto directamente
      const updatedProduct = { ...product, price: newPrice };
      this.productService.updateProduct(updatedProduct);

      /* después de haber calculado newPrice y actualizado el producto... */
      let priceEntry = this.pricesService.getPriceByProduct(idProduct);

      /* Si no existe una entrada de precio, creamos una completa que cumpla la interfaz */
      if (!priceEntry) {
        const newEntry: PriceEntry = {
          idProduct,
          adjustmentValue: 0,
          discountPercentage: 0,
          currentPrice: newPrice,
          priceAdjustment: 0,
          previousPrice: newPrice, // inicializamos previous igual al actual por defecto
          finalPrice: newPrice,
          adjustmentType: '+' // por defecto asumimos '+', puedes cambiarlo si aplica
        };

        // addOrUpdatePrice ya normaliza y persiste el PriceEntry
        this.pricesService.addOrUpdatePrice(newEntry);

        // recuperamos la entrada (opcional) para continuar la lógica unificada
        priceEntry = this.pricesService.getPriceByProduct(idProduct);
      }

      /* Si ahora existe priceEntry (nuevo o previo), actualizamos y persistimos con addOrUpdatePrice */
      if (priceEntry) {
        priceEntry.previousPrice = priceEntry.currentPrice;
        priceEntry.currentPrice = newPrice;

        /* recalcular finalPrice respetando adjustmentType/adjustmentValue */
        const adj = priceEntry.adjustmentValue ?? 0;
        
        if ( adj === 0 ) {
          priceEntry.finalPrice = newPrice;
        } else if ( priceEntry.adjustmentType === '-' ) {
          priceEntry.finalPrice = newPrice * (1 - adj / 100 );          
        } else{
          priceEntry.finalPrice = newPrice * (1 + adj / 100);
        }

        /* Persistir con metodo publico (upsert) */
        this.pricesService.addOrUpdatePrice(priceEntry);
      }      
    }
    
    /* Resetear precios temporales */
    this.priceTemporary[idProduct] = 0;
    this.percentageTemporary[idProduct] = 0;
    
    /* Reiniciar inputs manualmente a 0 */
    const percInput = document.getElementById(`perc-${idProduct}`) as HTMLInputElement;
    const dirInput = document.getElementById(`dir-${idProduct}`) as HTMLInputElement;
    if (percInput) percInput.value = '0';
    if (dirInput) dirInput.value = '0';
    
    /* Salir de modo edición (inhabilitar fila) */
    this.editMode[idProduct] = false;
  } /* fin de saveEdit */
  
  
  /* mt: cancelar la edición de un producto */
  public cancelEdit(idProduct: number): void {

    /* Desactivar la edicion */
    this.editMode[idProduct] = false;

    /* Limpiar pecio temporal */
    this.priceTemporary[idProduct] = null;

    /* Resetearmanualmente los inputs (por id único) */
    const percInput = document.getElementById( `perc-${idProduct}` ) as HTMLInputElement;
    const dirInput =document.getElementById( `dir-${idProduct}` ) as HTMLInputElement;
    if (percInput) percInput.value = '' ;
    if (dirInput) dirInput.value = '' ;
  } /* fin de cancelEdit */


  /* mt: cambiar estado de oferta de un producto */
  public toggleOffer( product: Product, checked: boolean ): void {

    /* Actualizar estado */
    product.isOffer = checked;

    /* Persiste en localStorage y emite cambios */
    this.productService.updateProduct(product);
  } /* fin de toggleOffer */

}