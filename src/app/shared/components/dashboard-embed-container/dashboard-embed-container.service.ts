import { HttpClient, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardEmbedContainerService {

  constructor(private appConfigService: AppConfigService, private http: HttpClient) { }

  getApplicationToken(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/security/token";
    return this.http.get(url).pipe(catchError((error) => {
      return this.handelError(error)
    })
    )
  }



  private handelError(error: HttpHeaderResponse) {
    return throwError(() => error)
  }
}
