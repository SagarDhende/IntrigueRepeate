import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { SessionService } from '../shared/services/session.service';
import { HttpClient } from '@angular/common/http';
import { IDatapodRequestObject, IDatasourceRequestObject, IDocumentRequestObject } from './gen-ai-model';

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {

  constructor(private appConfigService: AppConfigService, private sessionService: SessionService,
              private http: HttpClient) { }

  public getDocumentResult(documentObject:IDocumentRequestObject, requestId: string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/operator/a2ec20c6-c5b4-4d31-969e-13339e90ea9d/execute?version=1711016437187&logging=Y&requestId=" + requestId;
      return this.http.post(url,documentObject).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }

  public getDataSourceResult(datasourceObject:IDatasourceRequestObject, requestId: string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/operator/0e7deb70-b44e-4d76-8e01-44910dd49434/execute?version=1711016437187" + "&requestId=" + requestId;
      return this.http.post(url,datasourceObject).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }

  public getDatapodResult(datapodObject:IDatapodRequestObject, requestId: string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/operator/0e7deb70-b44e-4d76-8e01-44910dd49434/execute?version=1711016437187"+ "&requestId=" + requestId;;
      return this.http.post(url,datapodObject).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }
 
  public postDocument(formData: any, categoryUuid: string, ragType:string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/genAi/uploadDocumentsFile?categoryUuid=" + categoryUuid + "&ragType=" + ragType;
    return this.http.post(url, formData).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAllLatest(type: string, active: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getAllLatest?action=view&active=" + active + "&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getAllDocumentsByCategory(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/genAi/getDocumentsByCategory?categoryUuid=" + uuid;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }


  public getOneByUuidAndVersion(type: string, uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getOneByUuidAndVersion?action=view&uuid=" + uuid + "&version=" + "&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getGraphByText(type: string, uuid: string, text: string, requestId: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/graphpod/getGraphByText?action=view&uuid=" + uuid + "&type=" + type + 
                         "&nodeId=" + "&nodeType=" + "&degree=" + "&text=" + text + "&requestId=" + requestId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public sendFeedback(requestId:string, userFeedback:string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/operator/feedback?requestId=" + requestId + "&userFeedback=" + userFeedback;
      return this.http.post(url,null).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
    ))
  }

  public getConfigList(propertyName:string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/config/list?propertyName=" + propertyName;
      return this.http.get(url).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
    ))
  }

  public deleteAnswer(requestId:string): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
      let url = baseUrl + "/operator/delete?requestId=" + requestId;
      return this.http.post(url,null).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
    ))
  }

  public sendFlagged(requestId:string, flagged: string){
    let baseUrl = this.appConfigService.getBaseUrl() + this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + "/operator/feedback?requestId=" + requestId  + "&flagged=" + flagged;
    return this.http.post(url,null).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
  ))
  }

}
