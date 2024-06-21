import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { SubjectService } from '../shared/services/subject.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrl: any;
  controllerBaseUrl: any;
  constructor(private http: HttpClient, private appConfigService: AppConfigService,private subjectService:SubjectService) {
    this.baseUrl = this.appConfigService.getBaseUrl();
    this.controllerBaseUrl = this.appConfigService.getBaseControllerUrl();
  }

  public validateUser(userName: String, password: String): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + '/security/session/auth?username=' + userName;
    const headers = new HttpHeaders()
      .set('password', 'Basic ' + btoa(userName + ":" + password))
      .set('Access-Control-Allow-Origin', '*');
    const httpOptions = {
      headers: headers,
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

  public logout (sessionId): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/security/session/logout";
    this.subjectService.entity$.next(null);
    this.subjectService.application$.next(null);
    this.subjectService.user$.next(null);
    //this.subjectService.themeBehaviour.unsubscribe();
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

  public validateEmailToken(email: String, token: String): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + '/login/validateEmailAndToken?emailId=' + email + "&tokenId=" + token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      }),
      observe: 'response' as 'body'
    };
    return this.http.get(url,httpOptions)
      .pipe(
        catchError((error) => {
          console.log("service error" + error);
          return this.handelError(error);
        })
      )
  }
 
  private handelError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error)
  }
}
