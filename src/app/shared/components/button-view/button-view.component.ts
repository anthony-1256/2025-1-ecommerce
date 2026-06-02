/* button-view.component.html */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-view',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './button-view.component.html',
  styleUrl: './button-view.component.css'
})
export class ButtonViewComponent {

  @Input() currentView: string = 'cards-group';

  @Output() viewChange: EventEmitter< string > = new EventEmitter< string >;

  toggleView(view: string) {    
    this.viewChange.emit(view);
  }

}