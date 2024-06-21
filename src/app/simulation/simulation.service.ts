import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, Observable, throwError } from 'rxjs';
import { ScenarioInfo } from './scenario-info.model';
import { AppConfigService } from '../app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from '../shared/services/session.service';
import { LogWebSocketService } from '../shared/services/log-web-socket.service';


@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  rxStomp: any;
  constructor(private http: HttpClient, private fb: FormBuilder, private appConfigService: AppConfigService, private sessionService: SessionService,
    private logWebSocketService: LogWebSocketService) {
  }

  // to delete the log in existing simulation list
  public deleteExistingSimulatedLog(id: any, type:string) {
    console.log(id)
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/delete?action=delete" + "&id=" + id + "&type=" +type
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url,httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public getGraphSample = function (uuid: string, version: string, data: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/" + uuid + "/sample?version=" + version + "&limit=" + 100;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, data, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public simulateClone(uuid: string, version: string, data: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/clone?version=" + version
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, data, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public simulateRollBack(uuid: string, version: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/rollback?version=" + version
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public simulateRedo(uuid: string, version: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/redo?version=" + version
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public getGraphBySimulateExecSample(uuid: string, version: string, data: any, limit: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/sample?version=" + version + "&limit=" + limit
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, data, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public simulateRun(uuid: string, version: string, data: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/run?version=" + version
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, data, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public simulateExecution(uuid: string, version: string, data: any): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/execute?version=" + version
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, data, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public simulateStatus(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/status";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public simulateOutput(uuid: string, simulateId: number, outputId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/" + simulateId + "/output/" + outputId;
    return this.http.get(url).pipe(catchError((response) => {
      response.outputId = outputId;
      return throwError(() => response);
    }));
  }

  public cloneLogs(uuid: string, version: string, limit: number, offset: number, level: string, type: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/clone/logs?type=" + type + "&offset=" + offset + "&limit=" + limit + "&level=" + level;
    return this.http.get(url).pipe(catchError((response) => {
      return throwError(() => response);
    }))
  }

  public runLogs(uuid: string, version: string, limit: number, offset: number, level: string, type: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/graph/simulate/" + uuid + "/run/logs?type=" + type + "&offset=" + offset + "&limit=" + limit + "&level=" + level;
    return this.http.get(url).pipe(catchError((response) => {
      return throwError(() => response);
    }))
  }


  public logsWithWS(uuid: string, version: string, metaType: string, offset: number, logType: any): Observable<any> {
    let logbody: any = {};
    console.log(logbody)
    logbody.uuid = uuid;
    logbody.version = version;
    logbody.logType = logType;
    logbody.offset = offset;
    logbody.type = metaType;
    return this.logWebSocketService.getLogs(logbody)

  }

  public getScenarioDefaultValue = function (): ScenarioInfo {
    let scenarioInfo: ScenarioInfo = {
      "id": 0,
      "name": "New Simulation",
      isHeaderEdit: false,
      isShowTabEdit: false,
      isGSExecutionInprogess: false,
      isGSExecutionError: false,
      isGSExecutionSuccess: false,
      graphSimulateForm: new FormGroup({
        selectedGraphSimulate: new FormControl({ value: '', disabled: true }),
      }),
      ruleParamForm: this.fb.group({ rows: this.fb.array([]) }),
      isSimulateRunBtnShow: true,
      isSimulateRunBtnDisabled: true,
      errorContent: null,
      outputInfo: []
    }
    return scenarioInfo
  }
}
