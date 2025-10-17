// src/app/core/guards/invitation.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvitationGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      // If the user is logged in, allow access
      return true;
    }
    
    // If not logged in, check for an invitation token
    const token = route.queryParamMap.get('token');
    
    if (token) {
      // If token exists, allow access to the route
      return true;
    }
    
    // If neither logged in nor has a token, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}