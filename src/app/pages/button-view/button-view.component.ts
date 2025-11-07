/***** src/app/pages/button-view/button-view.component.html *****/

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-button-view',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './button-view.component.html',
  styleUrl: './button-view.component.css'
})
export class ButtonViewComponent {

  @Output() viewChange = new EventEmitter<string>();

  toggleView(view: string) {
    this.viewChange.emit(view);
  }

}