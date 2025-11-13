import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { catchError, Observable, throwError } from 'rxjs';
import { InvitedUser } from '../../types/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor() { }

  private http = inject(HttpClient);
  private baseUrl: string = environment.baseURL;

  inviteUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/inviteUser`, data).pipe(
      catchError((error) => {
        console.error('Error during user invitation:', error);
        return throwError(() => new Error('User invitation failed. Please try again.'));
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


  getInvitedUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}user/getInvitedUsers`).pipe(
      catchError((error) => {
        console.error('Error fetching invited users:', error);
        return throwError(() => new Error('Failed to fetch invited users. Please try again.'));
      })
    );
  }

  deleteInvitedUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}user/deleteInvitedUser/${userId}`).pipe(
      catchError((error) => {
        console.error('Error deleting invited user:', error);
        return throwError(() => new Error('Failed to delete user. Please try again.'));
      })
    );
  }

  updateUser(userId: string, userData: Partial<InvitedUser>): Observable<any> {
    return this.http.patch(`${this.baseUrl}user/update/${userId}`, userData).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user. Please try again.'));
      })
    );
  }


  getUserInvitationEmailTemplate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}user/get_user_invitation_email_template`).pipe(
      catchError((error) => {
        console.error('Error fetching user invitation email template', error);
        return throwError(() => new Error('Failed to fetch user invitation email template. Please try again.'));
      })
    );
  }

  updateUserInvitationEmailTemplate(template: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}user/update_user_invitation_email_template`, template).pipe(
      catchError((error) => {
        console.error("Error updating the user invitation email template")
        return throwError(() => new Error('Failed to update user invitation email template. Please try again'))
      }))
  }

  getIncorporationDocuments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}user/get-incorporation-documents`).pipe(
      catchError((error) => {
        console.error('Error fetching incorporation documents', error);
        return throwError(() => new Error('Failed to fetch incorporation documents. Please try again.'));
      })
    );
  }


  getEmailTemplate(templateName: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}user/get-incorporation-email-template/${templateName}`).pipe(
      catchError((error) => {
        console.error('Error fetching incorporation email template', error);
        return throwError(() => new Error('Failed to fetch incorporation email template. Please try again.'));
      })
    );
  }

  updateEmailTemplate(templateName: string, data: { subject: string; html: string }): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}user/update-incorporation-email-template/${templateName}`, data)
      .pipe(
        catchError((error) => {
          console.error('Error updating incorporation email template', error);
          return throwError(() => new Error('Failed to update incorporation email template. Please try again.'));
        })
      );
  }


  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}user/getUser/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching user', error);
        return throwError(() => new Error('Failed to fetch user. Please try again.'));
      })
    );
  }

}
