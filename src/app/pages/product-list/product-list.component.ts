/***** src/app/pages/product-list/product-list.component.ts *****/

import { Component } from '@angular/core';
import { ButtonViewComponent } from "../button-view/button-view.component";
import { CardsComponent } from "../cards/cards.component";
import { CardsGroupComponent } from "../cards-group/cards-group.component";
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

/* ***** COMPONENTE ***** */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ CommonModule, ButtonViewComponent, CardsComponent, CardsGroupComponent ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  /* ***** PROPIEDADES ***** */
  /* ar: arreglo principal de productos */
  products: Product[] = [];
  
  /* ob: vista actual activa */
  currentView: string = 'cards-group';
  /* fin PROPIEDADES */


  /* ***** CONSTRUCTOR ***** */
  constructor( private productService: ProductService ) {

    /* Inicialización de productos locales */
    this.products = this.productService.getAllProducts();

    /* Suscripción reactiva a cambios en productos */
    this.productService.products$.subscribe(products => {
      this.products = products;
    });

  } /* fin Constructor */


  /* ***** MÉTODOS ***** */
  /* mt: changeView */
  changeView(view: string) {
    this.currentView = view;
  } /* fin changeView */

} /* fin ProductListComponent */