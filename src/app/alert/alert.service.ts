import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, debounceTime, map } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { SessionService } from '../shared/services/session.service';
import { AlertView } from './alert-view-model';
import { INotification } from '../shared/models/API/notification.model';
import { Stage } from '../shared/enums/stage.enum';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: HttpClient, private appConfigService: AppConfigService, private sessionService: SessionService) { }

  getAlertAnalysisCriteria(alertView: AlertView, offset: number, limit: number, sortBy: string, sortOrderBy: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = null;
    if (sortBy != "" && sortOrderBy != "") {
      url = baseUrl + controllerUrl + "/alert" + "?offset=" + offset + "&limit=" + limit
        + "&sortBy=" + sortBy + "&sortOrder=" + sortOrderBy + "&entityId=" + alertView.entityId + "&entityType=" + alertView.entityType
        + "&startTime=" + alertView.startTime + "&endTime=" + alertView.endTime + "&alertId=" + alertView.alertId
        + "&alertName=" + alertView.alertName + "&severity=" + alertView.severity + "&runMode="+"&owner="+alertView.owner+"&stage="+alertView.stageType;
    } else {
      url = baseUrl + controllerUrl + "/alert" + "?offset=" + offset + "&limit=" + limit + "&entityId=" + alertView.entityId + "&entityType=" + alertView.entityType
        + "&startTime=" + alertView.startTime + "&endTime=" + alertView.endTime + "&alertId=" + alertView.alertId
        + "&alertName=" + alertView.alertName + "&severity=" + alertView.severity + "&runMode="+"&owner="+alertView.owner+"&stage="+alertView.stageType;;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url, httpOptions).pipe(catchError((error) => {
      return this.sessionService.handleError(error);;
    }));

  }

  public getEntity(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/entity/list";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public getAlertName(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/alert/list";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public getAppConfigByApplication(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/application/configInfo";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public postAlertId(param: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/search?searchStr=" + param;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public postEntityId(param: any, type: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/" + type + "/search?searchStr=" + param;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getEntityDetails(type: any, id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/" + type + "/" + id;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getAlertCases(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/cases";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getEntityByAlertExec(alertExecUuid: string, type: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + alertExecUuid + "/entity";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getAlertSummary(alert_id: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + alert_id + "/summary";
    return this.http.get(url).pipe(
      catchError((response) => {
      return this.sessionService.handleError(response);
    }))

  }
  public getAlertByAlertExec(uuid: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/alertExec/" + uuid;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getRuleRowDetails(req: any, id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/details?offset=0&limit=300&sortBy=criteria_name&sortOrder=desc";
    return this.http.post(url, req).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getCriteriaByBusinessRule(ruleUuid: String, criteriaId: String): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/rule/" + ruleUuid + "/criteria/" + criteriaId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getCriteriaDetails(req: any, alertId): any {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/criteria?offset=0&limit=20&sortBy=&sortOrder=desc";
    return this.http.post(url, {
      action: 'view',
      ruleExecUuid: req.rule_exec_uuid,
      ruleExecVersion: req.rule_exec_version,
      ruleUuid: req.rule_uuid,
      ruleVersion: req.rule_version,
      criteriaId: req.criteria_id,
      businessDate: req.business_date,
      entityId: req.entity_id,
      alertId: alertId
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getRuleDetails(req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + req.alertId + "/rules?offset&limit=&sortBy=&sortOrder=desc";
    return this.http.post(url, req).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getFlowOfFunds(req: any, range: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + req.id + "/flowoffunds?entityId=" + req.entityId + "&minValue=" + range[0] + "&maxValue=" + range[1] + "&uuid=" + req.uuid;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public postDocument(id: any, formData: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/document";
    return this.http.post(url, formData).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public downloadDocument(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/download/document";
    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public viewDocument(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/view/document";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public deleteDocument(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/document/" + req;
    return this.http.delete(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public resendNotification(id: string, alertId: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + alertId + "/resendNotification/" + id;
    return this.http.get(url).pipe(catchError((response: any) => {
      return this.sessionService.handleError(response)
    }))
  }
  public postNote(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/note";
    return this.http.post(url, { noteText: req, operationType: 'I', noteId: null }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public deleteNote(req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/note/" + req;
    return this.http.delete(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public putNote(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/note";
    return this.http.put(url, { noteText: req.noteText, noteId: req.noteId }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public notificationAttachmentDownload(id: string, alertExecUuid: string, alertExecVersion: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/download/notification?alertExecUUID=" + alertExecUuid + "&alertExecVersion=" + alertExecVersion;
    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(catchError((response) => {
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
  public getNotes(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/note";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getDocumentDetails(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/document";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getNotifications(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/notification";
    return this.http.get(url).pipe(
      map((response: INotification[]) => {
        let result = new Array();
        if (response != null && response.length > 0) {
          for (let notification of response) {
            if (notification.statusList == null) {
              notification.statusList = [{ "stage": Stage.FAILED, "createdOn": new Date() }]
            }
            notification.status = notification.statusList[notification.statusList.length - 1];
            result.push(notification);
          }
        }
        return result;
      }),
      catchError((response) => {
        return this.sessionService.handleError(response);
      }))
  }

  public getWorkflow(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/workflow";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getHistory(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/alert/" + id + "/history?alertId=" + id;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public alertAction(alertIds:string,owner:string,status:string):Observable<any>{
     let baseUrl =this.appConfigService.getBaseUrl();
     let controllerUrl=this.appConfigService.getBaseControllerUrl();
     let url=baseUrl + controllerUrl +"/alert/action?alertIds="+alertIds+"&status="+status+"&owner="+owner;
     return this.http.post(url,null).pipe( catchError((response) =>{
       return this.sessionService.handleError(response);
     }))
  }
}

