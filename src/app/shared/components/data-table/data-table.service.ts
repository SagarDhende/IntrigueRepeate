import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionService } from '../../services/session.service';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTableService {

  constructor(private http:HttpClient,private appConfigService: AppConfigService,private sessionService:SessionService) { }


  public getResultByURL = function (url: any) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    url = baseUrl + controllerUrl + url;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
}
