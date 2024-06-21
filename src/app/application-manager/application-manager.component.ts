import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PrimeNGConfig } from 'primeng/api';
import { Subscriber, Subscription } from 'rxjs';

import { NgxSpinnerService } from "ngx-spinner";

import { ApplicationManagerService } from './application-manager.service';
import { SubjectService } from '../shared/services/subject.service';
import { SessionService } from '../shared/services/session.service';

import { Application } from './application-manager-model';
import { CommonService } from '../shared/services/common.service';
import { MetaType } from '../shared/enums/api/meta-type.enum';
import { LayoutService } from '../layout/service/app.layout.service';

@Component({
  selector: 'app-application-manager',
  templateUrl: './application-manager.component.html',
  styleUrls: ['./application-manager.component.scss']
})
export class ApplicationManagerComponent implements OnInit, OnDestroy {

  protected applicationFetched = false;
  protected errorPosition: string;
  protected messageHead: string = ""
  protected errorContent: string = ""
  protected errorTitle: string = ""
  protected showError: boolean = false;
  protected applications: Application[] = [];
  protected search: string = '';

  private subscriptions: Subscription[] = [];
  private selectApplication: Application;
  protected isAppSbumitInprogess: boolean = false;
  protected isAppSbumitError: boolean = false;
  private allEntity: any;
  private session: any
  private tempApplications: any = [];


  constructor(
    private router: Router,
    private primengConfig: PrimeNGConfig,
    private spinner: NgxSpinnerService,
    private appManagerService: ApplicationManagerService,
    private subjectShareService: SubjectService,
    private sessionService: SessionService,
    private commonService: CommonService,
    private layoutService:LayoutService) {
  }

  ngOnInit(): void {
    this.layoutService.hideMenu();
    this.getAllApplications()
  }

  //Method to search specific application
  protected searchApplication(): void {
    let res = [];
    this.applications = this.tempApplications;
    this.applications.forEach(element => {
      if (element.displayName.toLowerCase().includes(this.search.toLowerCase())) {
        res.push(element)
      }
    });
    this.applications = res;
  }

  //Method to submit specific application 
  protected submitApplication(application: Application, index: number): void {
    if (this.applications != null && this.applications.length > 0) {
      for (let i = 0; i < this.applications.length; i++) {
        this.applications[i].selected = false;
      }
    }
    this.spinner.show('application-manager-spinner');
    this.applications[index].selected = true;
    this.selectApplication = this.applications[index];
    this.isAppSbumitInprogess = true;
    const observableTemp = this.appManagerService.setApplication(application.uuid, application.roleId)
      .subscribe({
        next: (response) => {
          this.spinner.hide("application-manager-spinner");
          this.isAppSbumitInprogess = false;
          this.getApplication(application.uuid);
          let sessionLocalStorage = this.sessionService.getData();
          sessionLocalStorage.appName = this.selectApplication.displayName;
          sessionLocalStorage.appId = application.uuid;
          sessionLocalStorage.userUuid = response.userInfo.ref.uuid;
          this.sessionService.setData(sessionLocalStorage);
          //this.router.navigate(["/home"]);
          if(this.layoutService.state.staticMenuDesktopInactive){
            this.layoutService.onMenuToggle();
          }

        },
        error: (response) => {
          this.spinner.hide("application-manager-spinner");
          this.errorPosition="END";
          this.isAppSbumitError = true;
            this.errorTitle = 'Operation Failed';
            this.errorContent = response.error;
            this.messageHead = 'Operation Failed';
        }
      })
    this.addSubscribe(observableTemp);
  }

  //Method to convert first char of each word to uppercase of display name
  protected convertDisplayName(name: string): string {
    let newStr = name.split(' ')
    for (let i = 0; i < newStr.length; i++) {
      newStr[i] = newStr[i].charAt(0).toUpperCase();
    }
    return newStr.join('');
  }

  //Method to get all applications
  private getAllApplications(): void {
    this.applicationFetched = false
    this.spinner.show('application-manager-spinner');
    this.primengConfig.ripple = true;
    this.session = this.sessionService.getData();
    if (this.session.appId == null) {
      setTimeout(() => {
        const observableTemp = this.appManagerService.getApplications(this.session.userName).subscribe({
          next: (response) => {
            this.applicationFetched = true
            this.spinner.hide('application-manager-spinner')
            this.applications = response;
            this.tempApplications = response;
            this.subjectShareService.user$.next(this.session);
          },
          error: (err) => {
            this.applicationFetched = true
            this.spinner.hide("application-manager-spinner");
            this.showError = true;
            this.errorPosition="CENTER";
            this.errorTitle = 'Operation Failed';
            this.errorContent = err.error;
            this.messageHead = 'Operation Failed';
          }
        });
        this.addSubscribe(observableTemp)
      }, 1000)
    } else {
      setTimeout(() => {
        this.subjectShareService.user$.next(this.session);
      }, 1000);
      this.getEntity();
      this.router.navigate(["/home"])
    }
  }


  private getEntity(): void {
    const observableTemp = this.commonService.getEntity().subscribe({
      next: (response) => {
        this.allEntity = response;
        this.subjectShareService.entity$.next(this.allEntity);
      },
      error: (response) => {
        console.log(response);
      },
      complete: () => {
        observableTemp.unsubscribe();
      }
    });
  }

  private getApplication(uuid: string): void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.APPLICATION, uuid, null).subscribe({
      next: (response: any) => {
        this.subjectShareService.application$.next(response);
        localStorage.setItem("currency",response.currency);
      },
      error: (response: any) => { },
      complete: () => {
        observableTemp.unsubscribe();
      }
    })
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  ngOnDestroy() {
    //Method used for unsubscribing observables
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
