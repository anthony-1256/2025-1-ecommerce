/* product-list.component.ts */
import { Component } from '@angular/core';
import { ButtonViewComponent } from "../../../shared/components/button-view/button-view.component";
import { CardsComponent } from "../../../shared/components/cards/cards.component";
import { CardsGroupComponent } from "../../../shared/components/cards-group/cards-group.component";
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ CommonModule, ButtonViewComponent, CardsComponent, CardsGroupComponent ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  products: Product[] = [];  

  currentView: string = 'cards-group';
  
  constructor( private productService: ProductService ) {

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
      }
    });

    /* Suscripción reactiva a cambios en productos */
    this.productService.products$.subscribe(products => {
      this.products = products;
    });

  } /* fin Constructor */

  changeView(view: string) {
    this.currentView = view;
  } /* fin changeView */

} /* fin ProductListComponent */