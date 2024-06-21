import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { SessionService } from './session.service';
import { AppConfigService } from 'src/app/app-config.service';
import { HttpClient } from '@angular/common/http';
import { MetaType } from '../enums/api/meta-type.enum';
import { FinalFilterObject } from 'src/app/dataset/dataset-details/filter-model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  baseUrl: any;
  controllerBaseUrl: any;
  constructor(private http: HttpClient, private appConfigService: AppConfigService, private sessionService: SessionService) {
    this.baseUrl = this.appConfigService.getBaseUrl();
    this.controllerBaseUrl = this.appConfigService.getBaseControllerUrl();
  }

  public getBaseEntityStatusByCriteria(type: string, category: string, name: string,tags: string, userName: string, startDate: string, endDate: string, active: string, status: string, 
    limit: number, metaStatus: string, isExec: boolean, publishFlag: string,uuid?:string
    ) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = null;
    if (isExec && type == MetaType.UPLOADEXEC.toString()) {
      url = baseUrl + "/upload/getUploadExecByDatapod?action=view&type=uploadExec&uuid="+uuid;
    }
    else if (type == MetaType.REPORTEXEC) {
      url = baseUrl + "/report/getReportExecViewByCriteria?action=view&type=" + type + "&name=" + name + "&userName=" + userName + "&startDate=" + startDate + "&endDate=" + endDate + "&tags=" + "&active=" + active + "&published=" + "&status=" + status;
    }
    else if (isExec) {
      url = baseUrl + "/metadata/getBaseEntityStatusByCriteria?action=view&type=" + type + "&name=" + name + "&category=" + category + "&userName=" + userName + "&startDate=" + startDate + "&endDate=" + endDate + "&tags=" + "&active=" + active + "&published=" + "&status=" + status + "&moduleType=" + "&limit=" + limit;
    }
    else if(type == MetaType.DATAPOD){
      url = baseUrl  + this.controllerBaseUrl + "/meta/getBaseEntityByCriteria?action=view&type=" + MetaType.DATAPOD + "," + MetaType.DATASET + "&name=" + name + "&categoryInfo=" + category + "&userName=" + userName + "&startDate=" + startDate + "&endDate=" + endDate + "&tags=" + "&published=" +publishFlag + "&active=Y"  + "&moduleType="  + "&metaStatus=" + metaStatus;
    }
   
    else {
      url = baseUrl + "/metadata/getBaseEntityByCriteria?action=view&type=" + type + "&name=" + name + "&categoryInfo=" + category + "&userName=" + userName + "&startDate=" + startDate + "&endDate=" + endDate + "&tags=" + tags + "&published=" +publishFlag+ "&active=Y" + "&moduleType=" + "&metaStatus=" + metaStatus;
    }
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))

  }

  public getUserGroupByUserName(type: String, userName: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getUserGroupByUserName?action=view&type=" + type + "&userName=" + userName;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
 
  public getUserByOrg(type: String): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getUserByOrg?action=view&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getOnyByUuidAndVersion(type: string, uuid: string, version: string): Observable<any> {
    let url = this.baseUrl + this.controllerBaseUrl + '/meta/' + type + '/' + uuid;;
    if (version) {
      let url = this.baseUrl + this.controllerBaseUrl + "/meta/" + type + "/" + uuid + "/" + version;
    }
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public getEntity(): Observable<any> {
    let url = this.baseUrl + this.controllerBaseUrl + "/entity/entity/list";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public getAllLatest(type: string, active: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getAllLatest?action=view&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getAllLatestByType(type: string, publishFlag: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl +"/meta/list?type=" + type + "&publishFlag=" + publishFlag;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getLicenseInfo() {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/meta/license"
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getLhsCounts() {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/meta/stats";
    return this.http.get(url).pipe(catchError((response: any) => {
      return this.sessionService.handleError(response)
    }))
  }
  
  public getGraphByEntity(entityUuid: string, entityId: string, entityType: string, degree: string, type: string, edgeType: string, isImplicitId: boolean): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/" + entityId + "/graph?action=view&entityUuid=" + entityUuid +
      "&entityType=" + entityType + "&degree=" + degree + "&type=" + type + "&edgeType=" + edgeType + "&isImplicitId=" + isImplicitId;
    return this.http.post(url, null).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  getGraphAnalysis2(uuid: string, type: string, nodeType: string, degree: string, startDate: string, edge: string, endDate: string, body?: any, nodeId?: string): Observable<any> {
    if (!edge) {
      edge = ''
    }
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/" + uuid + "?action=view&type=" + type + "&nodeType=" + nodeType + "&degree=" + degree + "&startDate=" + startDate + "&endDate=" + endDate + "&nodeId=" + nodeId + "&edgeType=" + edge;
    return this.http.post(url, body).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getGraphpodByEntity(uuid: string, type: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/" + uuid + "/graph/meta";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  getApplicationToken(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/security/token";
    return this.http.get(url).pipe(catchError((error) => {
      return this.sessionService.handleError(error);
    })
    )
  }


  public getFormByBusinessKey(caseId: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl;
    url = url + "/workflow/FormByBusinessKey?action=view&businessKey=" + caseId;
    // return this.http.get(url,{ responseType: 'text' }).pipe(catchError((response) => {

    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public submitFormByBusinessKey(caseId: string, data: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl;
    url = url + "/workflow/submitFormByBusinessKey?action=view&businessKey=" + caseId;
    return this.http.post(url, data).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }


  public getParamByGraphSimulate(uuid: string, version: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/metadata/getParamByGraphSimulate?uuid=" + uuid + "&version=" + version + "&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public downloadLogs(type: String, uuid: string, version: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/downloadLog?action=view&execUuid=" + uuid + "&execVersion=" + version + "&type=" + type;
    return this.http.get(url, { responseType: 'text' }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))
  }

  public readLogs(type: String, uuid: string, version: string): Observable<any> {
    console.log('type', type)
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/readInfoLog?action=view&type=" + type + "&uuid=" + uuid + "&version=" + version + "&offset= 0" + "&limit=-500";
    console.log(url)
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))
  }

  public getOneById(type: string, id: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + "/common/getOneById?action=view&type=" + type + "&id=" + id;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public submit(data: any, type: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    return this.http.post(baseUrl + '/common/submit?action=edit&type=' + type, data, { responseType: 'text' }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getParamByRule(uuid: string, version: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/metadata/getParamByRule?uuid=" + uuid + "&version=" + version + "&type=" + type;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getSourceAttribute(uuid: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl;
    if (type == MetaType.DATAPOD) {
      url = url + "/metadata/getAttributesByDatapod?action=view&uuid=" + uuid + "&type=" + type;
    }
    if (type == MetaType.DATASET) {
      url = url + "/metadata/getAttributesByDataset?action=view&uuid=" + uuid + "&type=" + type;
    }
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getDatapodPreview(UUID: string, version: string, rows: number, filterObj?:FinalFilterObject): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/datapod/getDatapodPreview?action=view" + "&datapodUUID=" + UUID + "&datapodVersion=" + version + "&rows=" + rows;
    console.log(url)
    return this.http.post(url, filterObj).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))
  }
  

  public getDatasetPreview(UUID: string, filterObj?:FinalFilterObject): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + this.controllerBaseUrl + "/dataset/getDatasetPreview?action=view" + "&datasetUUID=" + UUID;
    console.log(url)
    return this.http.post(url, filterObj).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))
  }

  public uploadFile(uuid: string, mode: string, metaType: string,formData:any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/datapod/upload?action=edit&datapodUuid=" + uuid + "&type=" + metaType + "&desc=&saveMode="+mode
    return this.http.post(url, formData).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }
    ))
  }

  public getReportSample(UUID: string, version: string, rows: number, filterObj?:{}): Observable<any>{
    let baseUrl = this.appConfigService.getBaseUrl();
      let url = baseUrl + "/report/preview?action=view" + "&uuid=" + UUID + "&version=" + version + "&rows=" + rows;
      console.log(url, filterObj)
      return this.http.post(url,filterObj).pipe(catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }
   

  public reportDownloadResult(uuid: string, version: string, rows: number, format: string, layout: string, filterObj?: any, isDownloadReportArchive: boolean = false): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url: string;
    if (isDownloadReportArchive) {
      url = `${baseUrl}/report/downloadReport?action=view&uuid=${uuid}&version=${version}`;
    } 
    return this.http.get(url, { observe: 'response', responseType: 'arraybuffer' }).pipe(
      catchError((response) => {
        return this.sessionService.handleError(response);
      })
    );
  }

  public downloadResult(url: string,  type: string, filterObj?:FinalFilterObject): Observable<any>{
      if(type == 'post'){
        return this.http.post(url,filterObj,{ observe: 'response', responseType: 'arraybuffer' }).pipe(
          catchError((response) => {
            return this.sessionService.handleError(response);
          }
        ))
      }
      else if(type == 'get'){
        return this.http.get(url, { observe: 'response', responseType: 'arraybuffer' }).pipe(
          catchError((response) => {
            return this.sessionService.handleError(response);
          })
        );
      }
  }
}
