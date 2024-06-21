import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { LoginService } from 'src/app/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private userData: any = null;
  private lhsData: any;
  constructor(private http: HttpClient,
    private loginService: LoginService,
    private router: Router,private appConfigService:AppConfigService) { }


  public isAuthenticated(): boolean {
    this.getData();
    if(this.userData != null)
      return true;
    return false;
  }

  public setData(userData: any): void {
    this.userData = { ...userData };
    localStorage.setItem('userData', JSON.stringify(this.userData));
  }

  public getData(): any {
   let userData=JSON.parse(localStorage.getItem('userData'));
    if(this.userData ==null){
      this.userData=userData;
    }
    return this.userData; 
  }
   
  public clear(): void {
    localStorage.removeItem('userData');
  }

  public logout(): void {
    let userData = this.getData();
    try {
      this.loginService.logout(userData.sessionId)
        .subscribe({
          next: (response) => {
            this.clear()
            this.router.navigate(["login"]);
             location.reload();
            // localStorage.removeItem('userData');
          },
          error: (response) => {
            this.clear();
            this.router.navigate(["login"]);
            location.reload();
            // localStorage.removeItem('userData');
          }
        })
    } catch (e) {
      this.router.navigate(["login"]);
    }

  }

  public handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status == 401 || error.statusText == 'Unauthorized') {
      // this.logout();
    }
    return throwError(() => error)
  }
  public unlockUser(userName: String, password: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/security/session/unlock?username=" + userName + "&password=" + password;
    return this.http.get(url).pipe(catchError((response) => {
      return this.handleError(response);
    }));
  }

}
