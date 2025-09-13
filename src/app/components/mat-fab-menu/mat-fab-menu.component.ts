import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IconOptions, MatIconModule } from '@angular/material/icon';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
  host: {
    '(document:click)': 'onClick($event)'
  },
  selector: 'app-mat-fab-menu',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './mat-fab-menu.component.html',
  styleUrl: './mat-fab-menu.component.scss',
  animations:
    [trigger('openMenu', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('.2s ease-in', style({ transform: 'translateY(120%)', opacity: 0 }))
      ])
    ])]
})
export class MatFabMenuComponent {
  private _eref = inject(ElementRef);

  menuButtons = input<MenuButton[]>([]);
  customIcon = input<string>('menu');
  opened = false;

  private onClick(event: Event) {
    if (this.opened && !this._eref.nativeElement.contains(event.target)) // or some similar check
      this.opened = false;
  }
}

export interface MenuButton {
  icon: string,
  name?: string,
  fn?: () => void
}