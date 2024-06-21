import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { AppConfigService } from 'src/app/app-config.service';
import { MetaType } from '../../enums/api/meta-type.enum';



@Injectable({
  providedIn: 'root'
})
export class CommonListService {


  constructor(private http: HttpClient, private sessionService: SessionService, private appConfigService: AppConfigService) { }
  public getPriv() {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controller = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controller +"/security/getRolePriv"
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url,httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  // to delete the log in existing simulation list
  public deleteExistingSimulatedLog(id: any, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/delete?action=delete" + "&id=" + id + "&type=" + type
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public viewLogs(uuid: string, type: string, version: any) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/execStatusChart?action=view" + "&type=" + type + "&uuid=" + uuid + "&version=" + version
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));

  }
  public getUuid(uuid: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/getLatestByUuid?action=view" + "&uuid=" + uuid + "&type=" + type
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.get(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));

  }
  public Killed(uuid: string, type: string, version: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/setStatus" + "&uuid=" + uuid + "&version=" + version + "&type=" + type + "&status=KILLED"
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public Restart(uuid: string, version: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/restart?&uuid=" + uuid + "&version=" + version + "&type=" + type + "action=execute"
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public Lock(id: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/lock?action=lock" + "&id=" + id + "&type=" + type
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public unLock(id: string, type: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/unLock?action=lock" + "&id=" + id + "&type=" + type
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.put(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  public Clone(uuid: string, type: any, version: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let url = baseUrl + "/common/saveAs?action=clone" + "&uuid=" + uuid + "&type=" + type + "&version=" + version
    console.log(url)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post(url, httpOptions).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }
  private commonLogs = {
    [MetaType.GRAPHSIMULATEExec]: {
      commonUrl: '/simulation/simulation-details/',
      caption: 'graphSimulateExec'
    },
    [MetaType.DATAPOD]: {
      commonUrl: '/case/case-details/',
      caption: 'datapod'
    }
  }

  public getCommonLogs(type?: string): any {
    return this.commonLogs[type]
  }
  public getNodificationStatusCaption(type?: string): any {
    const commonLogsEntry = this.getCommonLogs(type);
    return commonLogsEntry.commonUrl;
  }
  public getParamByPipeline(uuid,version):any{
    let baseUrl = this.appConfigService.getBaseUrl();
    let controller = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controller+"/pipeline/" + uuid + "/param?version=" + version
      return this.http.get(url).pipe(
      catchError((response) => {
        return this.sessionService.handleError(response);
      }
      ))
  }
  public getExecuteParamByPipeline(uuid, version, payload): any {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controller = this.appConfigService.getBaseControllerUrl();
    let url = `${baseUrl}${controller}/pipeline/${uuid}/execute?version=${version}`;
    
    return this.http.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      } 
    }).pipe(
      catchError((response) => {
        return this.sessionService.handleError(response);
      })
    );
  }
}

