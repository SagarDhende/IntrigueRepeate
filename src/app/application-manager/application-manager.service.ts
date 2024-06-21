import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable} from 'rxjs';

import { AppConfigService } from '../app-config.service';
import { SessionService } from '../shared/services/session.service';

import { Application } from './application-manager-model';
import { IAppManager } from  '../shared/models/API/app-info.model';


@Injectable({
  providedIn: 'root'
})
export class ApplicationManagerService {
  constructor(private http: HttpClient, private appConfigService: AppConfigService, private sessionService: SessionService) { }

  //API used to fetch all applications
  public getApplications = function (userName): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/application/list?userName=" + userName;
    return this.http.get(url).pipe(
      map((response: IAppManager[]) => {
        for (let data of response) {        
        let appsList: Application[] = [];
        let classList_4 = ["fa fa-money"];
        let classList_5 = { "fa fa-money": "fa-solid fa-money-bill-1" };
        if (data != null) {
          for (let i = 0; i < data.appInfo.length; i++) {
            let apppliationInfo: Application = new Application;
            apppliationInfo.uuid = data.appInfo[i].appId.ref.uuid;
            apppliationInfo.name = data.appInfo[i].appId.ref.name
            apppliationInfo.displayName = data.appInfo[i].appId.ref.name
            apppliationInfo.roleId =  data.appInfo[i].roleInfo[0].ref.uuid
            apppliationInfo.desc =data.appInfo[i].applicationDesc;
            //apppliationInfo.desc ="An enterprise data warehouse (EDW) is a database, or collection of databases, that centralizes a business's information from multiple sources and applicationsAn enterprise data warehouse (EDW) is a database, or collection of databases, that centralizes a business's information from multiple sources and applications, and makes it available for analytics and use across the organization. EDWs can be housed in an on-premise server or in the cloud."; //data.appInfo[i].applicationDesc;
            if (data.appInfo[i].applicationIcon != null) {
              apppliationInfo.iconClass = data.appInfo[i].applicationIcon;
              if (classList_4.indexOf(data.appInfo[i].applicationIcon) != -1) {
                apppliationInfo.iconClass = classList_5[data.appInfo[i].applicationIcon];
              }
            } else {
              apppliationInfo.iconClass = "fa fa-user"
            }
            apppliationInfo.index = Math.floor((Math.random() * 8) + 0);
            appsList.push(apppliationInfo);
          }
        }
        return this.sortAppList(appsList)
      }
      }),
      catchError((response) => {
        return this.sessionService.handleError(response);
      }))
  }

  // function used to sort App List
  private sortAppList(appsList: Application[]) {
    let names = []
    let result = []
    appsList.forEach(element => {
      names.push(element.displayName)
    });
    names.sort();
    names.forEach(element => {
      appsList.forEach(element2 => {
        if (element == element2.displayName) {
          result.push(element2);
        }
      });
    });
    return result
  }

  //API to set specific application
  public setApplication(appId: string, roleId: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/application/" + appId + "/set?roleUUID=" + roleId;
    return this.http.post(url, null).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

}






