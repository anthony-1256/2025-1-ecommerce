/* ***** src/app/components/main.component.ts ***** */
import { Component } from '@angular/core';
import { CardsComponent } from '../../pages/cards/cards.component';
import { CardsGroupComponent } from '../../pages/cards-group/cards-group.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ CommonModule, CardsGroupComponent, CardsComponent ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {  

}
