import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { ShareCapital } from '../../pages/summary/summary.component';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor() { }

  private http = inject(HttpClient);
  private baseUrl: string = environment.baseURL;
  private payloadSubject = new BehaviorSubject<any>(null);

submitCompanyInfo(payload: any) {
  if (payload.companyId) {
      console.log("update existing company")
      console.log("payload : ",payload) 
    const { companyId, ...updateData } = payload;
    return this.http.put<{ message: string, companyId: string }>
      (`${this.baseUrl}company/updateCompanyInfo/${companyId}`, updateData);
  } else {
   console.log("create new company") 
    return this.http.post<{ message: string, companyId: string }>
      (`${this.baseUrl}company/createCompanyInfo`, payload);
  }
}

updateCurrentStage(payload: any): Observable<any>  {
 
      console.log("update company's current stage")
      console.log("payload : ",payload)  // Update company current stage
   
    return this.http.put<any>
      (`${this.baseUrl}company/updateCompanyCurrentStage/${payload.companyId}`, payload);
  
}


  shareCreation(data: any) {  
    console.log("creationOfShare",data);
    
    return this.http.post<{ message: string }>(`${this.baseUrl}company/creationOfShare`, data).pipe(
      catchError((error) => {
        console.error("Share creation error:", error);
        const errorMessage = error.error?.message || "Failed to create shares.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateShare(data: any) {
    console.log("Updating share:", data);
    
    return this.http.put<{ message: string }>(`${this.baseUrl}company/updateShare`, data).pipe(
      catchError((error) => {
        console.error("Share update error:", error);
        const errorMessage = error.error?.message || "Failed to update share.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  deleteShare(shareId: string, companyId: string) {
    console.log("Deleting share:", shareId);
    
    return this.http.delete<{ message: string }>(`${this.baseUrl}company/deleteShare/${shareId}/${companyId}`).pipe(
      catchError((error) => {
        console.error("Share deletion error:", error);
        const errorMessage = error.error?.message || "Failed to delete share.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  shareHoldersCreation(data: any): Observable<{ message: string }> {
    console.log('data',data);
    
    return this.http.post<{ message: string }>(`${this.baseUrl}company/shareHoldersInfo`, data).pipe(
      catchError((error) => {
        console.error("Share creation error:", error);
        const errorMessage = error.error?.message || "Failed to create shares.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateShareHolder(data: any): Observable<{ message: string }> {
    console.log("Updating shareholder data:", data)

    return this.http.put<{ message: string }>(`${this.baseUrl}company/updateShareHolder/${data._id}`, data).pipe(
      catchError((error) => {
        console.error("Shareholder update error:", error)
        const errorMessage = error.error?.message || "Failed to update shareholder."
        return throwError(() => new Error(errorMessage))
      }),
    )
  }

  deleteShareholder(shareholderId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}company/deleteShareHolder/${shareholderId}`).pipe(
      catchError((error) => {
        console.error("Shareholder deletion error:", error);
        const errorMessage = error.error?.message || "Failed to delete shareholder.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  

  getShareCapitalList(companyId: string, userId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('userId', userId);

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getShareCapitalList`, { params })
      .pipe(
        catchError((error) => {
          console.error("Shares capital list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get shares.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getShareHoldersList(companyId: string, userId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('userId', userId);

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getShareHoldersList`, { params })
      .pipe(
        catchError((error) => {
          console.error("Shares Holders list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get shares holders.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  InvateshareHoldersCreation(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}company/invateShare`, data).pipe(
      catchError((error) => {
        console.error("Share creation error:", error);
        const errorMessage = error.error?.message || "Failed to create shares.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteShareCapital(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}company/deleteShareCapital`,
      { params: { id } }
    ).pipe(
      catchError((error) => {
        console.error("Error deleting share capital:", error);
        const errorMessage = error.error?.message || "Failed to delete share capital.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  DirectorInfoCreation(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}company/directorInfoCreation`, data).pipe(
      catchError((error) => {
        console.error("Direct Information creation error:", error);
        const errorMessage = error.error?.message || "Failed to create directors.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDirectorsInfo(companyId: string, userId: string): Observable<{ message: string; data: any[] }> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('userId', userId);

    return this.http
      .get<{ message: string; data: any[] }>(`${this.baseUrl}company/getDirectorsInfo`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching directors info', error);
          const errorMessage = error.error?.message || 'Failed to get directors info.';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  deleteDirector(directorId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}company/deleteDirector/${directorId}`).pipe(
      catchError((error) => {
        console.error("Error deleting Director information:", error);
        const errorMessage = error.error?.message || "Failed to delete Director Information.";
        return throwError(() => new Error(errorMessage));
      })
    )
  }

  updateDirector(data: any): Observable<{ message: string }> {
    console.log("Updating director data:", data)

    return this.http.put<{ message: string }>(`${this.baseUrl}company/updateDirector/${data._id}`, data).pipe(
      catchError((error) => {
        console.error("Director update error:", error)
        const errorMessage = error.error?.message || "Failed to update director."
        return throwError(() => new Error(errorMessage))
      }),
    )
  }

  directorInviteCreation(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}company/inviteDirector`, data).pipe(
      catchError((error) => {
        console.error("Director Invite error:", error);
        const errorMessage = error.error?.message || "Failed to Invite Director.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  directorsInvites(companyId:string):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}company/getDirectorInvites/${companyId}`).pipe(
      catchError((error) => {
        console.error("Director Invite error:", error);
        const errorMessage = error.error?.message || "Failed to Invite Director.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  shareholdersInvites(companyId:string):Observable<any>{
    console.log('companyId from holders service', companyId);
    return this.http.get<any>(`${this.baseUrl}company/getShareholderInvites/${companyId}`).pipe(
      catchError((error) => {
        console.error("Shareholders Invite error:", error);
        const errorMessage = error.error?.message || "Failed to Invite Director.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  companySecretaryCreation(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}company/companySecretary`, data).pipe(
      catchError((error) => {
        console.error("comapany Secretry creation error:", error);
        const errorMessage = error.error?.message || "Failed to create company secretary.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getComapnyInfo(companyId: string) {
    return this.http.get(`${this.baseUrl}company/getCompanyInfo`, {
      params: { companyId }
    }).pipe(
      catchError((error) => {
        console.error("company information loading error", error);
        const errorMessage = "Failed to loading company Information.";
        return throwError(() => new Error(errorMessage));
      })
    )
  }

  getShareCapitalInfo(companyId: string): Observable<ShareCapital[]> {
    return this.http.get<ShareCapital[]>(`${this.baseUrl}company/getShareCapitalInfo`, {
      params: { companyId }
    }).pipe(
      catchError((error) => {
        console.error("company information loading error", error);
        const errorMessage = "Failed to loading company Information.";
        return throwError(() => new Error(errorMessage));
      })
    )
  }

  getShareHoldersListSummery(companyId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams()
      .set('companyId', companyId)

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getShareHoldersListSummery`, { params })
      .pipe(
        catchError((error) => {
          console.error("Shares Holders list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get shares holders.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }


  getDirectorInformation(companyId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams().set('companyId', companyId);

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getDirectorInformation`, { params })
      .pipe(
        catchError((error) => {
          console.error("Directors Holders list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get shares holders.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  signNccForm(companyId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams().set('companyId', companyId);

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getDirectorInformation`, { params })
      .pipe(
        catchError((error) => {
          console.error("Directors Holders list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get shares holders.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getCompanySecretaryInformation(companyId: string): Observable<{ message: string; data: any }> {
    const params = new HttpParams().set('companyId', companyId);

    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}company/getCompanySecretaryInformation`, { params })
      .pipe(
        catchError((error) => {
          console.error("company secretary list getting has an error", error);
          const errorMessage = error.error?.message || "Failed to get comapnay Secretary.";
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  storeCompanyData(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}company/storeCompanyData`, data).pipe(
      catchError((error) => {
        console.error("Company data storage error:", error);
        const errorMessage = error.error?.message || "Failed to store company data.";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  validateInvitationToken(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}company/validate-invitation`, { token });
  }

  getCompanyData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}company/getAllCompanys`);
  }

  acceptInvitation(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}company/accept-invitation`, formData);
  }

  setPayload(payload: any): void {
    this.payloadSubject.next(payload);
  }

  getPayload(): any {
    return this.payloadSubject.asObservable();
  }
}
