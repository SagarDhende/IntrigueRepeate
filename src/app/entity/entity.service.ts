import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { SessionService } from '../shared/services/session.service';
import { HttpClient,  } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private appConfigService: AppConfigService, private http: HttpClient, private sessionService: SessionService) { }

  public getEntityByType(uuid: string, type: string, offset: number, limit: number, sortBy: string, sortOrderBy, entityFilterAttributeHolders: any): Observable<any> {
    
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    // console.log('baseURL',baseUrl),
    // console.log('controllerURL',controllerUrl)
    let url = null;
    if (sortBy != "" && sortOrderBy != "") {
      url = baseUrl + controllerUrl + "/entity/" + type + "/list?entityUuid=" + uuid + "&offset=" + offset + "&limit=" + limit + "&sortBy=" + sortBy + "&sortOrder=" + sortOrderBy;
    } else {
      url = baseUrl + controllerUrl + "/entity/" + type + "/list?entityUuid=" + uuid + "&offset=" + offset + "&limit=" + limit;
    }
    return this.http.post(url, {
      "entityResponseFlag": {
        "data": "Y"
      },
      entityFilterAttributeHolders: entityFilterAttributeHolders
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    })
    )
  }

  public getEntityByFilter(uuid: string, type: string, entityFilterAttributeHolders: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = null;
    url = baseUrl + controllerUrl + "/entity/" + type + "/filter?entityUuid=" + uuid;
    return this.http.post(url, {
      "entityResponseFlag": {
        "unique": "Y",
        "max": "Y",
        "min": "Y"
      },
      entityFilterAttributeHolders: entityFilterAttributeHolders
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    })
    )
  }

  public getEntityDetails(type: any, id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/" + type + "/" + id;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getDynamicFilterValues(entityType: any, uuid: any, attributeId: any, query: any) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    // let url = baseUrl + controllerUrl + "/datapod/" + uuid + "/attributeId/" + attributeId + "?searchStr=" + query + "&uuid=" + uuid;
    let url = baseUrl + controllerUrl + "/entity/" + entityType + "/attribute/" + attributeId + "?searchStr=" + query + "&uuid=" + uuid;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getParamListParam(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    return this.http.get(baseUrl + controllerUrl + '/graph/' + uuid + '/params').pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }


   // @todo this session service was created already in different way
  // protected getAppConfigByApplication(): Observable<any> {
  //   let baseUrl = this.appConfigService.getBaseUrl();
  //   let controllerUrl = this.appConfigService.getBaseControllerUrl();
  //   // api to change move to common
  //   let url = baseUrl + controllerUrl + "/application/configInfo";
  //   return this.http.get(url).pipe(catchError((response) => {
  //     return this.sessionService.handleError(response);
  //   }))
  // }
}
