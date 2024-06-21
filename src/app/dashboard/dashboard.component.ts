import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscriber, tap } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { MetaType } from '../shared/enums/api/meta-type.enum';
import { AppState } from '../store/model/models/app-state.model';
import { ILogin } from '../store/model/models/auth.model';
import { DashboardService } from './dashboard.service';
import { SessionService } from '../shared/services/session.service';
// import { Session } from './store/models/auth.model';
// import { BrowserReload } from './store/actions/auth.actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // application: any;
  // isDashboardLoad: boolean = false
  // breadcrumb: any;
  // dashboardId: string = null
  // dashboardVersion: string = null
  // @ViewChild('reportViewer') iframe: ElementRef;
  // dashboardURL: any;

  // constructor(private store: Store<AppState>,
  //   private dashboardService: DashboardService,
  //   public appConfigService: AppConfigService) { }

  // ngOnInit(): void {
  //   let tempSession = this.store.select(store => store.loginDetail);
  //   this.breadcrumb = [{ title: 'Dashboard', url: false }]
  //   tempSession.pipe(tap((response: any) => { console.log("") })).subscribe({
  //     next: (res: any) => {
  //       let sessionDetail: ILogin;
  //       sessionDetail = res.data;
  //       if (sessionDetail.appId != null)
  //         this.getApplication(sessionDetail.appId.toString());
  //     }
  //   });
  // }

  // private getApplication(uuid: string) {
  //   this.dashboardService.getApplication(uuid).subscribe({
  //     next: (response: any) => {
  //       debugger
  //       this.application = response.meta;
  //       if (this.application != null && this.application.homePage != null) {
  //         if (this.application.homePage.ref.type == MetaType.DASHBOARD) {
  //           this.dashboardId = this.application.homePage.ref.uuid;
  //           this.dashboardVersion = this.application.homePage.ref.version;
  //         } else if (this.application.homePage.ref.type == MetaType.SIMPLE) {
  //           this.dashboardURL = this.application.homePage.value;
  //         }
  //         localStorage.setItem("currency", this.application.currency);
  //         this.isDashboardLoad = true;
  //       }
  //       this.dashboardId ="f2b13068-1f02-417d-98c3-67f39be38b53";
  //     }
  //   })
  // }


  application: any;
  isDashboardLoad: boolean = false;
  breadcrumb: any;
  dashboardId: string = null;
  dashboardVersion: string = null;
  @ViewChild('reportViewer') iframe: ElementRef;
  dashboardURL: any;

  constructor(
    private dashboardService: DashboardService,
    public appConfigService: AppConfigService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    
    // Get session data from SessionService
    const sessionDetail = this.sessionService.getData();

    if (sessionDetail && sessionDetail.appId) {
      console.log(sessionDetail.appId,"appId")
      this.getApplication(sessionDetail.appId.toString());
    }
  }

  private getApplication(uuid: string) {
    this.dashboardService.getApplication(uuid).subscribe({
      next: (response: any) => {
        debugger;
        this.application = response.meta;
        if (this.application && this.application.homePage) {
          const homePageRef = this.application.homePage.ref;
          if (homePageRef.type === MetaType.DASHBOARD) {
            this.dashboardId = homePageRef.uuid;
            this.dashboardVersion = homePageRef.version;
          } else if (homePageRef.type === MetaType.SIMPLE) {
            this.dashboardURL = this.application.homePage.value;
          }
          localStorage.setItem("currency", this.application.currency);
          this.isDashboardLoad = true;
        }
        // this.dashboardId = "f2b13068-1f02-417d-98c3-67f39be38b53";
      },
      error: (err) => {
        console.error('Error fetching application details', err);
      }
    });
  }
}
