import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  categories : string[] = [];

  @Output() categorySelected = new EventEmitter<string>();

  constructor( private productService: ProductService ){}

  ngOnInit(): void {
    this.categories = this.productService.getCategories();
  }

  selectCategory(category: string): void {
    this.categorySelected.emit(category);
  }

}
