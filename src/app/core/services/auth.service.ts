import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  private http = inject(HttpClient);
  private baseUrl: string = environment.baseURL;
  private router=inject(Router)
  
  // login(data:any):Observable<any>{
  //   return this.http.post(`${this.baseUrl}user/login`,data)
  // }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/login`, data).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }
  
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}user/getUser/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching user:', error);
        return throwError(() => new Error('Failed to fetch user. Please try again.'));
      })
    );
  }
  
  
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/register`, data).pipe(
      catchError((error) => {
        console.error('Error registering user:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

 // auth.service.ts
verifyOtp(data: { email: string; twoFactorCode: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}user/verify-otp`, data).pipe(
    tap(response => {
      if (response) {
        console.log("respoonse",response);
        
        // Store any necessary user data in localStorage/state if needed
        //localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(['/user-dashboard']);
      }
    }),
    catchError((error) => {
      console.error('Two Factor Verification Error:', error);
      return throwError(() => new Error('OTP verification failed. Please check your code and try again.'));
    })
  );
}

forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}user/forgot-password`, { email }).pipe(
    catchError((error) => {
      console.error('Error in forgot password:', error);
      return throwError(() => new Error('Failed to process password reset'));
    })
  );
}


  resendCode(payload: { email: string }) {
    return this.http.post(`${this.baseUrl}user/resendCode`, payload).pipe(
      catchError((error) => {
        console.error('Resend code not working', error);
        return throwError(() => new Error('Failed to resend the code. Please try again later.'));
      })
    );
  }

  // logout() {
  //   return  this.http.post(`${this.baseUrl}/user/logout`, {}).pipe(
  //     catchError((error) => {
  //       console.error('Logout not working', error);
  //       return throwError(() => new Error('Failed to log out. Please try again later.'));
  //     }))
  // }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
}

isLoggedIn(): boolean {
  const userId = localStorage.getItem('userId');
  return userId !== null; 
}

isAdmin(): boolean {
  return localStorage.getItem('userRole') === 'Admin';
}

getUserId(): any {
  const userId = localStorage.getItem('userId');
  return userId ; 
}



  


  // logout(){
  //   localStorage.removeItem("authToken");
  // }

}
