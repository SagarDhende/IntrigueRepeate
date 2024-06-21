import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subscriber, throwError, map } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { SessionService } from '../shared/services/session.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private appConfigService: AppConfigService, private http: HttpClient, private sessionService: SessionService) { }

  getApplication(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/application/config/" + uuid + "?type=application";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    })
    )
  }

  getApplicationToken(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/security/token";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    })
    )
  }

  getHTML(url: string): Observable<any> {
    // let options = new RequestOptions();
    // options.headers = new Headers();
    // options.headers.append('AUTH-TOKEN', 'SomeToken123');
    // options.responseType = ResponseContentType.Blob;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': "application/octet-stream",
        "X-Frame-Options": "*"
      }),
      observe: 'response' as 'body'
    };
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;

      this.http
        .get(url, httpOptions)
        .subscribe(m => {
          objectUrl = URL.createObjectURL(m["blob"]());
          observer.next(objectUrl);
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }

  private handelError(error: HttpHeaderResponse) {
    return throwError(() => error)
  }


}
