/* home.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from '../../business/offers/offers.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule, OffersComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  isLoading: boolean = false;

  ngOnInit(): void {
    this.isLoading = true;

    setTimeout(() => { this.isLoading = false; }, 500);
  }

}