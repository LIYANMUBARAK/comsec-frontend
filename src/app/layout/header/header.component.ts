import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isDropdownOpen = false;
  isDarkTheme = false;
  userId: any;
  private authService = inject(AuthService);
  userData: any;
  private themeService = inject(ThemeService);
  isNotificationDropdownOpen = false;

toggleNotificationDropdown() {
  this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
}

  ngOnInit() {
    console.log('heyylloo thereeeee');
    
    this.getUserDatas();
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    this.applyTheme();
    this.themeService.isDarkTheme$.subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }

  getUserDatas() {
    this.userId = this.authService.getUserId();
    console.log('userId:', this.userId);

    if (this.userId) {
      this.authService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userData = user;
          console.log('User data:', this.userData);
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        }
      });
    } else {
      console.log('User is not logged in or userId is not available.');
    }
  }

  showFeatureNotAvailable(feature: string) {
    Swal.fire({
      position: "top-end",
      icon: 'info',
      title: 'Feature Not Available',
      text: `The ${feature} page is currently under development. Check back soon!`,
      toast: true,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout() {
    this.authService.logout();
  }
}