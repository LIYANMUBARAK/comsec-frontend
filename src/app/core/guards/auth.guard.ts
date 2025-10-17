// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check if this is an invitation route with a token
    const isInvitationRoute = route.routeConfig?.path?.includes('project-form') && 
                             route.queryParams['token'] !== undefined;
    
    if (isInvitationRoute) {
      console.log("he camee");
      
      // Allow access to invitation routes with tokens
      return true;
    }
    
    // Regular auth check for other routes
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // If admin tries to access user routes, redirect to admin dashboard
    if (this.authService.isAdmin()) {
      console.log("he is admin");
      this.router.navigate(['/admin-dashboard']);
      return false;
    }
    
    return true;
  }
}