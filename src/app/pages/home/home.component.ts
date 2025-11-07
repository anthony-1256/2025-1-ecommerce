/* home.component.ts */
import { Component } from '@angular/core';
import { OffersComponent } from "../offers/offers.component";
import { ButtonViewComponent } from '../button-view/button-view.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ ButtonViewComponent, OffersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
