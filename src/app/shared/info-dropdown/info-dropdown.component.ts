import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-info-dropdown',
  templateUrl: './info-dropdown.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class InfoDropdownComponent {
  isOpen = false;
  private timer: any;

  onEnter(): void {
    this.timer = setTimeout(() => {
      this.isOpen = true;
    }, 1000); // 1 second delay
  }

  onLeave(): void {
    clearTimeout(this.timer);
    this.isOpen = false;
  }
}
