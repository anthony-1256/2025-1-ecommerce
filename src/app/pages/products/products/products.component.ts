/* products.component.ts */
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { Subscription } from 'rxjs';
import { ButtonViewComponent } from '../../../shared/components/button-view/button-view.component';
import { CardsGroupComponent } from '../../../shared/components/cards-group/cards-group.component';
import { CardsComponent } from '../../../shared/components/cards/cards.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ CommonModule, ButtonViewComponent, CardsGroupComponent, CardsComponent ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  currentView: string = 'cards-group';
  isLoading: boolean = false;

  private productService = inject( ProductService );
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.isLoading = true;

    const sub = this.productService.getProducts().subscribe({
      next: ( products ) => {
        this.products = products;
        this.isLoading = false;
      },

      error: ( err ) => {
        console.error( 'Error al cargar productos:', err );
        this.isLoading = false;
      }
    });

    this.subscriptions.add( sub );
  } /* end ngOnInit */

  changeView( view: string ) {
    this.currentView = view;
  } /* end changeView */

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  } /* end ngOnDestroy */

} /*  */