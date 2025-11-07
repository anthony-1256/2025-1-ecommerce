/* home.component.ts */
import { Component } from '@angular/core';
import { OffersComponent } from "../offers/offers.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [OffersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
