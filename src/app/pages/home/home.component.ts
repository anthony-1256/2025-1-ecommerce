/* home.component.ts */
import { Component } from '@angular/core';
import { OffersComponent } from "../offers/offers.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [OffersComponent, CommonModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  isLoading: boolean = false;

  ngOnint(): void {
    this.isLoading = true;

    setTimeout(() => { this.isLoading = false; }, 500);
  }

}
