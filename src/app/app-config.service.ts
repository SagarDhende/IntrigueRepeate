import { Inject, Injectable } from '@angular/core';
import{DOCUMENT} from '@angular/common';
import { SocialSSO } from './login/auth.model';
import { IDownloadSetting, OrgSetting } from './app-settings.models';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  
  public dashboardOverviewTabVisible:boolean=false; 
  private urlConfig:any;
  private baseUrl:any;
  public  readonly version: string = '1.0.0';
  private wsBaseUrl: string;
  private isBaseUrlConfig:boolean=true;
  public themeSettingVisible:boolean=false;

  constructor(@Inject(DOCUMENT) private document:any  ) {
    this.baseUrl=window.location.origin+"/framework";
    this.wsBaseUrl=window.location.origin+"/framework".split("http");
    this.urlConfig={
      protocol:'http://',
      // host:"13.232.26.161:8080",
      host:'65.1.212.204:8080',
      port:null,
      contextPath:'framework'
    }
  }

  private orgSetting: OrgSetting = {
    companyName: 'Inferyx, Inc.',
    companyLink: 'https://inferyx.com',
    title: 'Inferyx',
    favicon: 'favicon.ico',
    version:'1.0.1'
  }

  private downloadSetting: IDownloadSetting = {
    rows: 100000,
    minRows: 1,
    maxRows: 100000
  }

  public getOrgSetting(): OrgSetting {
    return this.orgSetting;
  }

  public getDownloadSettings(): IDownloadSetting{
    return this.downloadSetting;
  }

  public getBaseUrl(): string {
    let baseUrl:any;
    if(this.isBaseUrlConfig){
       baseUrl = /localhost/.test(window.location.href) ? "http://localhost:4200" : this.urlConfig.protocol + "" + this.urlConfig.host + "/" + this.urlConfig.contextPath;
    }else{
      baseUrl=this.baseUrl;
    }
    return baseUrl;
  }

  public getWSBaseUrl():string{
    let baseUrl;
    if(this.isBaseUrlConfig){
      baseUrl = /localhost/.test(window.location.href) ? "ws://localhost:4200" :  "ws://" + this.urlConfig.host + "/" + this.urlConfig.contextPath;
    }else{
      baseUrl=this.wsBaseUrl;
    }
    return baseUrl;
   }

  private thresholdIndDefs: any = {
    'HIGH': {
      name: 'HIGH',
      caption: 'High',
      "bg-color": '#dc3545',
      fgcolor: 'white',
      bgClass: 'severity-high'
    },
    'MEDIUM': {
      name: 'MEDIUM',
      caption: 'Medium',
      "bg-color": '#ffc107',
      fgcolor: 'white',
      bgClass: 'severity-medium'
    },
    'LOW': {
      name: 'LOW',
      caption: 'Low',
      "bg-color": '#34bfa3',
      fgcolor: 'white',
      bgClass: 'severity-low'
    },
    'INFO': {
      name: 'INFO',
      caption: 'Info',
      "bg-color": "#36a3f7",
      fgcolor: 'white',
      bgClass: 'severity-info'
    }
  };


  private notificationStatus: any = {
    'VALID': {
      name: 'VALID',
      caption: 'Valid',
      "bg-color": '#34bfa3',
    },
    'INVALID': {
      name: 'INVALID',
      caption: 'Invalid',
      "bg-color": '#dc3545',
    }
  }

  private notificationDefs: any = {
    'PENDING': {
      name: 'Pending',
      caption: 'Pending',
      fgcolor: 'white',
      "bg-color": '#dc3545',
    },
    'FAILED': {
      name: 'FAILED',
      caption: 'Failed',
      "bg-color": '#dc3545',
    },
    'STARTING': {
      name: 'STARTING',
      caption: 'Starting',
      "bg-color": '#ffc107',
    },
    'READY': {
      name: 'READY',
      caption: 'Ready',
      "bg-color": '#ffc107',
    },
    'RUNNING': {
      name: 'RUNNING',
      caption: 'Running',
      "bg-color": '#ffc107',
    },
    'COMPLETED': {
      name: 'COMPLETED',
      caption: 'Success',
      "bg-color": '#34bfa3',
    },
    'QUEUED': {
      name: 'QUEUED',
      caption: 'Queued',
      "bg-color": '#6c757d',
    },
    'NOTRUNNING': {
      name: 'NOTRUNNING',
      caption: 'Not Running',
      fgcolor: 'white',
      "bg-color": '#6c757d',
    },
  };
  
 
  public getBaseControllerUrl(): string {
    let controller = "/api/v1";
    return controller;
  }

  public getThresholdIndDefs(severity: string): any {
    return this.thresholdIndDefs;
  }

  public getSeverity(severity: string): any {
    return this.thresholdIndDefs[severity]
  }

  public getSeveritryCaption(severity: string): any {
    return this.getSeverity(severity)["caption"];
  }

  public getSeverityBGColor(severity: string): any {
    return this.getSeverity(severity)['bg-color']
  }


  public getNotificationDefs(status: string): any {
    return this.notificationDefs[status]
  }

  public getNotificationCaption(status: string): any {
    return this.getNotificationDefs(status)?.["caption"];
  }

  public getNotificationBgColor(status: string): any {
    return this.getNotificationDefs(status)?.['bg-color'];
  }

  public getNodificationStatusBgColor(status: string): any {
    return this.getNotificationStatus(status)['bg-color'];
  }

  public getNotificationStatus(status: string): any {
    return this.notificationStatus[status]
  }
  public getNodificationStatusCaption(status: string): any {
    return this.getNotificationStatus(status)['caption'];
  }

  public getSocialSso(): SocialSSO {
    return this.socialSso;
  }
  private socialSso: SocialSSO = {
    googleAuthVisible: true,
    googleAuthClientId: '13844115729-1og9u2n8go29t7mn41cdrufdo34phg46.apps.googleusercontent.com',
  };

  public getButtonVisibility(): boolean {
    return this.themeSettingVisible;
  }
  public setButtonVisibility(state: boolean): void {
    this.themeSettingVisible = state;
  }
}
