import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { Observable, catchError } from 'rxjs';
import { SessionService } from '../shared/services/session.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessRuleService {
  
  private baseUrl: string;
  private controllerUrl: string;
   
  constructor(private http:HttpClient,private appConfigService:AppConfigService,private sessionService:SessionService) {
   this.baseUrl = this.appConfigService.getBaseUrl();
   this.controllerUrl = this.appConfigService.getBaseControllerUrl();
  }

  public execute (uuids:string, requestObj: any):Observable<any>{
    let url=null;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    url = this.baseUrl + this.controllerUrl+"/rule/execute?uuids="+uuids+"&action=execute&isDebug=false"
    return this.http.post(url,requestObj,httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  
  public getParamByRules(uuids): Observable<any>{
    let url = this.baseUrl + this.controllerUrl+"/rule/getParamByRules?&action=view" + "&uuids=" +uuids;
      return this.http.get(url).pipe(
      catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }

}
