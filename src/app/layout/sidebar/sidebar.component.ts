import { Component, inject } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);
   dropdownStates: { [key: string]: boolean } = {
    admin: false,
    incorporation: false,
    annualReturn: false
  };

  // Toggle dropdown method
  toggleDropdown(key: string): void {
    this.dropdownStates[key] = !this.dropdownStates[key];
  }
 logout() {
    this.authService.logout();
  }
}
