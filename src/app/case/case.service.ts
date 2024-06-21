import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AlertView } from '../alert/alert-view-model';
import { AppConfigService } from '../app-config.service';
import { Stage } from '../shared/enums/stage.enum';
//import { INotification } from '../shared/models/API/notification.model';
import { SessionService } from '../shared/services/session.service';
import { CaseView } from './case-view-model';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  constructor(private http: HttpClient, private appConfigService: AppConfigService, private sessionService: SessionService) { }

  public getCaseAnalysisCriteria(caseView: CaseView, offset: number, limit: number, sortBy: string, sortOrderBy: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = null;
    if (sortBy != "" && sortOrderBy != "") {
      url = baseUrl + controllerUrl + "/case" + "?offset=" + offset + "&limit=" + limit + "&sortBy=" + sortBy + "&sortOrder=" + sortOrderBy
        + caseView.entityType + '&entityId=' + caseView.entityId + '&severity=' + caseView.severity + '&caseType=' + caseView.caseType + '&caseRuleName=' + caseView.caseRuleName
        + '&caseRuleId=' + caseView.caseRuleId + '&startTime=' + caseView.startTime + '&endTime=' + caseView.endTime + '&businessDate=' + caseView.businessDate + "&owner=" + caseView.owner + "&stage=" + caseView.stageType + "&userGroup=" + caseView.userGroup;
    } else {
      url = baseUrl + controllerUrl + "/case" + "?offset=" + offset + "&limit=" + limit + '&entityType='
        + caseView.entityType + '&entityId=' + caseView.entityId + '&severity=' + caseView.severity + '&caseType=' + caseView.caseType + '&caseRuleName=' + caseView.caseRuleName
        + '&caseRuleId=' + caseView.caseRuleId + '&startTime=' + caseView.startTime + '&endTime=' + caseView.endTime + '&businessDate=' + caseView.businessDate + "&owner=" + caseView.owner + "&stage=" + caseView.stageType + "&userGroup=" + caseView.userGroup;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url, httpOptions).pipe(catchError((error) => {
      return this.sessionService.handleError(error);
    })
    )
  }

  public getEntity(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/entity/entity/list";
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

  public postCaseId(param: any) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/search?searchStr=" + param;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getCaseName(caseType: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = '';
    if (caseType) {
      // api to change
      url = baseUrl + controllerUrl + "/meta/case/" + caseType.name;
    }
    else {
      url = baseUrl + controllerUrl + "/entity/caserule/list";
    }
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getCaseDetails(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/summary";
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
  public updateCaseSummary(item: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + item.case_id + "?priority=" + item.priority;
    return this.http.put(url, { priority: item.priority, severity: item.severity, owner: item.owner, status: item.status, desposition_code: item.desposition_code }).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }
  public getAlertDetails(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/alerts";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getNotes(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/note";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public postNote(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/note";
    return this.http.post(url, { noteText: req, operationType: 'I', noteId: null }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public putNote(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/note";
    return this.http.put(url, { noteText: req.noteText, operationType: 'U', noteId: req.noteId }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public deleteNote(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/note/" + req;
    return this.http.delete(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getDocumentDetails(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/document";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public deleteDocument(id: any, req: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/document/" + req;
    return this.http.delete(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public postDocument(id: any, formData: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/document";
    return this.http.post(url, formData).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public downloadDocument(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/download/document";
    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getOwnerDetails(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/application/user";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

   public getHistory(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/history?caseId=" + id;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getWorkflow(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/workflow";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public createCase(caseView: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case";
    return this.http.post(url, caseView).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getActions(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/actions";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public postActions(id: any, action: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/actions?caseAction=" + action;
    return this.http.post(url, { action: action }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
  public getFlowOfFunds(req: any, range: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + req.caseId + "/flowoffunds?uuid=" + req.uuid + "&entityId=" + req.entityId + "&minValue=" + range[0] + "&maxValue=" + range[1];
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getNotifications(id: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/notification";
    return this.http.get(url).pipe(
      map((response: any[]) => {
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

  public notificationAttachmentDownload(id: string, caseExecUuid: string, caseExecVersion: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + id + "/download/notification?caseExecUUID=" + caseExecUuid + "&caseExecVersion=" + caseExecVersion;
    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public resendNotification(id: string, alertId: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + alertId + "/resendNotification/" + id;
    return this.http.get(url).pipe(catchError((response: any) => {
      return this.sessionService.handleError(response)
    }))
  }
  public getAlertsList(alertView: AlertView, offset: number, limit: number, sortBy: string, sortOrderBy: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = null;
    if (sortBy != "" && sortOrderBy != "") {
      url = baseUrl + controllerUrl + "/alert" + "?offset=" + offset + "&limit=" + limit
        + "&sortBy=" + sortBy + "&sortOrder=" + sortOrderBy + "&entityId=" + alertView.entityId + "&entityType=" + alertView.entityType
        + "&startTime=" + alertView.startTime + "&endTime=" + alertView.endTime + "&alertId=" + alertView.alertId
        + "&alertName=" + alertView.alertName + "&severity=" + alertView.severity + "&runMode=";
    } else {
      url = baseUrl + controllerUrl + "/alert" + "?offset=" + offset + "&limit=" + limit + "&entityId=" + alertView.entityId + "&entityType=" + alertView.entityType
        + "&startTime=" + alertView.startTime + "&endTime=" + alertView.endTime + "&alertId=" + alertView.alertId
        + "&alertName=" + alertView.alertName + "&severity=" + alertView.severity + "&runMode=";
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url, httpOptions).pipe(catchError((error) => {
      return this.handelError(error);
    }));
  }

  public getAppConfigByApplication(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    // api to change move to common
    let url = baseUrl + controllerUrl + "/application/configInfo";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getEntityByCaseExec(caseExecUuid: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/" + caseExecUuid + "/entity";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);

    }))
  }

  public getCaseByCaseExec(uuid: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/case/caseExec/" + uuid;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAllLatestParamList(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    return this.http.get(baseUrl + controllerUrl + '/graph/paramlist/graphpod/list?templateFlg=Y&type=paramlist').pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getParamListParam(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    return this.http.get(baseUrl + controllerUrl + '/graph/' + uuid + '/params').pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  private handelError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error)
  }

}