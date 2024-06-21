import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppConfigService } from '../app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  baseUrl: any;
  controllerBaseUrl: any;
  constructor(private http: HttpClient,private appConfigService: AppConfigService) {
    this.baseUrl = this.appConfigService.getBaseUrl();
    this.controllerBaseUrl = this.appConfigService.getBaseControllerUrl();
   }


  public validateUser (userName: string, password: string) {
    let url =this.baseUrl + this.controllerBaseUrl +"/security/session/auth?username=" + userName;
    const httpOptions = {
      headers: new HttpHeaders({
        'password': 'Basic ' + btoa(userName + ":" + password),
        'Access-Control-Allow-Origin': '*'
      }),
      observe: 'response' as 'body'
    };
    return this.http.get(url, httpOptions)
      .pipe(
        catchError((error) => {
          console.error("service error" + error);
          return this.handelError(error);
        })
      )
  }
  private handelError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error)
  }

  public logout(sessionId:string): Observable<any> {
    let url = "/security/session/logout";
    const httpOptions = {
      headers: new HttpHeaders({
        'sessionId': sessionId.toString()
      }),
    };
    return this.http.get(url, httpOptions)
      .pipe(
        catchError((error) => {
          return this.handelError(error);
        })
      )
  }



}
