// src/app/core/guards/no-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class noAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // If user is already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/user-dashboard']);
      }
      return false;
    }
    return true;
  }
}