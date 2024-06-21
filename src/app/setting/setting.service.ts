import { Injectable } from '@angular/core';
import { SessionService } from '../shared/services/session.service';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

constructor(private http: HttpClient, private sessionService: SessionService, private appConfigService: AppConfigService) { }

public postUserDetails(req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    // api to change
    return this.http.put(baseUrl + controllerUrl + '/security/user/' + req.userName, req, { responseType: 'text' })
      .pipe(
        catchError((response) => {
          console.log(response)
          return this.sessionService.handleError(response);
        }))
  }

public getUserById(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    //api to change
    return this.http.get(baseUrl + controllerUrl + '/security/user/' + id).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
}
