import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkTheme(true);
    }
  }

  setDarkTheme(isDark: boolean) {
    this.isDarkThemeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    this.setDarkTheme(!this.isDarkThemeSubject.value);
  }
}
