/* sidebar.component.ts */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
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

  constructor( private categoryService: CategoryService ){}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories.map(category => category.name);
    });
  } /* end ngOnInit */

  selectCategory(category: string): void {
    this.categorySelected.emit(category);
  } /* end selectCategory */

} /* end SidebarComponent */