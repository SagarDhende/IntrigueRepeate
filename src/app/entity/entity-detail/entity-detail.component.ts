import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TabView } from 'primeng/tabview';
import { Subscriber, Subscription } from 'rxjs';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { GraphpodResultView } from 'src/app/shared/models/API/graphpod-result-view.model';
import { IGraphpod } from 'src/app/shared/models/API/graphpod.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { EntityService } from '../entity.service';
import { SubjectService } from 'src/app/shared/services/subject.service';
import { AppConfig, LayoutService } from 'src/app/layout/service/app.layout.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrl: './entity-detail.component.scss'
})
export class EntityDetailComponent implements OnInit, OnDestroy {

  @ViewChild(TabView) tabView: TabView;

  protected version: string;
  protected entityDetails: any;
  protected errorMessage:boolean;

  protected entityDetailsLeft: any = [];
  protected entityDetailsRight: any = [];
  protected isEntityDetailsInProgress:boolean = false;
  protected isEntityDetailsComplete:boolean = false;
  protected isEntityDetailsNoRecords:boolean = false;
  protected isEntityDetailsError:boolean = false;

  protected isLinkAnalysisError: boolean = false;
  protected isGraphpodMeta: boolean = false
  protected isLinkAnalysisComplete: boolean;
  protected isLinkAnalysisInProgress: boolean;
  protected isLinkAnalysisNoRecords:boolean = false


  protected isDashboardRender: boolean = false;
  protected dashboardId: string = null;
  protected dashboardFilter: { key: string, value: string }[] = [];
  protected tabIndex: number;
  protected entityError: boolean = false;
  protected messageHead: string = '';
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected linkAnalysisFetched: boolean = false;
  protected linkAnalysisResult: GraphpodResultView;
  protected linkAnalysisError: string;
  protected isShowGraphAnalysis: boolean;
  protected graphpodMeta: IGraphpod;
  protected graphReload: boolean = false
  protected isAppendMode: boolean;
  protected isMaximized: boolean = false;

  themeConfig: AppConfig;
  private breadcrumb: any;
  private currentTabBreadcrumb: any;
  private entityDetailsFetched: boolean = false;
  private subscriptions: Subscription[] = [];
  private entityObj: any;
  private paramDialogList: any;
  private prevUrl: any;
  private duuid: string;
  protected type: string;
  private uuid: string;
  protected id: any;

  @Input() details: any;

  constructor(private urlService: UrlService, private router: Router, private route: ActivatedRoute,
    private entityService: EntityService, private location: Location,
    private commonService: CommonService, private subjectShareService: SubjectService, private spinner: NgxSpinnerService,private layoutService:LayoutService) { 
     
    this.subjectShareService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      },
      error: (response) => {

      }
    })
  }
  // ---------------------```````````````````------------------


  ngOnInit(): void {
    const observableTemp = this.urlService.previousUrl$.subscribe({
      next: (previousUrl: string) => {
        this.prevUrl = previousUrl;
      }
    });
    this.addSubscribe(observableTemp);
    if (!this.details) {

      this.route.queryParams.subscribe({
        next: (params: any) => {
          this.type = params.type;
          this.uuid = params.uuid;
          this.id = params.id;
        }
      });
    }

    // when calling from component selector
    if (this.details) {
      this.type = this.details.type;
      this.uuid = this.details.uuid;
      this.id = this.details.id;
    }

    this.breadcrumb = [
      { title: 'Entity', url: false },
      { title: this.type, url: '/entity/entity/' + this.type + '/' + this.uuid + '/' + this.duuid + '/' + this.version },
      { title: this.id, url: false },]
    this.getEntityDetails();
    this.getEntityByUuid(this.uuid, this.version);
    this.tabIndex = 0;
    this.spinner.show("summarySpinner");
    setTimeout(() => {
      this.spinner.hide("summarySpinner");
    }, 3000);
  }

  // Entity Details

  private getEntityByUuid(uuid: string, version: string):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.ENTITY, uuid, version).subscribe(res => {
      this.entityObj = res;
      if (res.dashboard)
        this.dashboardId = res.dashboard.ref.uuid;
      this.isDashboardRender = true;
      this.dashboardFilter = [{ key: res.keyAttr.attrName, value: this.id }]
    });
    this.addSubscribe(observableTemp);

  }

  protected getEntityDetails(): void {
    if (!this.entityDetailsFetched) {
      this.entityDetailsFetched = true;
      this.isEntityDetailsComplete = false;
      this.isEntityDetailsInProgress = true;
      this.entityDetails = undefined;
      this.entityDetailsLeft = undefined;
      this.entityDetailsRight = undefined;
      this.spinner.show("entityDetails");
      const observableTemp = this.entityService.getEntityDetails(this.type, this.id).subscribe({
        next: (response: any) => {
          if(this.entityDetails===undefined || this.entityDetails == null || this.entityDetails.data.length == 0 ||
             this.entityDetails.data == undefined){
            this.isEntityDetailsNoRecords = true;
          }
            this.entityDetails = response.data[0];
            this.isEntityDetailsComplete = true;
            this.isEntityDetailsInProgress = false;
            let names = Object.keys(this.entityDetails);
            let middleIndex = Math.ceil(names.length / 2);
            this.entityDetailsLeft = names.splice(0, middleIndex);
            this.entityDetailsRight = names.splice(-middleIndex);
            this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
            this.breadcrumb.push(this.currentTabBreadcrumb);
            this.spinner.hide("entityDetails");
        },
        error: (err: any) => {
          this.spinner.hide("entityDetails");
          this.isEntityDetailsError = true;
          this.isEntityDetailsInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  /* convertName and shortenText this function use for details tab */
 
  protected convertName(name): any {
    return name.toLowerCase().split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
  }

  protected shortenText(text: any): string {
    let short = ''
    if (text != null) {
      if (text.length > 45) {
        short = text.substring(0, 45);
        short = short + '...'
      }
      else {
        short = text;
      }
    }
    return short
  }

  protected refreshDetails(): void {
    // if (this.tabIndex == 0) {
    //   this.refreshDashboard()
    // }
    if (this.tabIndex == 0) {
      this.entityDetailsFetched = false;
      this.getEntityDetails()
      this.spinner.show("entityDetails");

    }
    if (this.tabIndex == 1) {
      this.linkAnalysisFetched = false;
      this.isShowGraphAnalysis = false;
    }
    // this.entityDetails = undefined;
    // this.tabIndex = 0;
    this.tabChange();
  }

  protected toogleIsMaximized():void {
    this.isMaximized = !this.isMaximized;
    this.layoutService.onMenuToggle();
  }

  /*protected refreshDashboard():void {
    this.spinner.show("summarySpinner");
    let sub = this.subjectShareService.themeBehaviour.asObservable().subscribe({
      next: (response => {
        this.subjectShareService.theme = response;
      })
    })
    setTimeout(() => {
      sub.unsubscribe();
      this.spinner.hide("summarySpinner");
    }, 2000);
  }*/

  protected tabChange(): void {
    this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
    this.breadcrumb.pop();
    this.breadcrumb.push(this.currentTabBreadcrumb);
    if (this.tabIndex == 0) {
      this.getEntityDetails();
    }
    if (this.tabIndex == 1) {
      this.getGraphpodByEntity(this.uuid, MetaType.GRAPHPOD);
    }
  }


  //Start Link Analyisis Tab

  protected getGraphpodByEntity(entityUuid: string, type: string):void {
    if (!this.linkAnalysisFetched) {
      this.isGraphpodMeta = false
      this.isLinkAnalysisNoRecords = false
      this.isShowGraphAnalysis = false;
      this.isLinkAnalysisInProgress = true
      this.isLinkAnalysisComplete = false
      this.isLinkAnalysisError = false;
      this.spinner.show("entity-graph-analysis");
      const observableTemp = this.commonService.getGraphpodByEntity(entityUuid, type).subscribe({
        next: (response: IGraphpod) => {
          if(response !=null){
            this.graphpodMeta = response;
            if (this.entityObj != null && this.entityObj.graphAnalysisInfo != null) {
              this.getGraphAnalysisByUuid(this.entityObj.graphAnalysisInfo.ref.uuid);
            } else {
              this.getGraphByEntity(this.uuid, this.id, this.type, "", MetaType.GRAPHPOD, "", false, false);
            }
          }else {
            setTimeout(() => {
              this.spinner.hide("entity-graph-analysis");
              this.isShowGraphAnalysis = false;
              this.isLinkAnalysisInProgress = false
              this.linkAnalysisFetched = true;
              this.isGraphpodMeta = true;
            }, 500);
          }
        },
        error: (err) => {
          this.isLinkAnalysisError = true;
          this.isLinkAnalysisInProgress = false
          this.spinner.hide("entity-graph-analysis");
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed'

        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  protected getGraphByEntity(entityUuid: string, entityId: string, entityType: string, degree: string, type: string, edgeType: string, isAppendMode: boolean, isImplicitId: boolean):void {
    this.commonService.getGraphByEntity(entityUuid, entityId, entityType, degree, type, edgeType, isImplicitId).subscribe({
      next: (response: GraphpodResultView) => {
        this.spinner.hide("entity-graph-analysis");
        this.spinner.hide("entity-graph-analysisreload");
        this.linkAnalysisResult = response;
        this.graphReload = false;
        this.isLinkAnalysisInProgress = false;
        if(this.linkAnalysisResult.nodes == null && this.linkAnalysisResult.edges == null){
          this.isLinkAnalysisNoRecords = true;
        }
        else{
          this.isLinkAnalysisComplete = true;
        }
        this.isAppendMode = isAppendMode;
        this.isShowGraphAnalysis = true;
      },
      error: (err) => {
        this.spinner.hide("entity-graph-analysis");
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'

      }
    })
  }

  protected onNodeDblClick(event: any):void {
    this.graphReload = true;
    let id = event.id;
    let degree = '1'
    if (event.degree)
      degree = event.degree;
    // if(this.type== event.nodeType){
    //     id=this.id;
    // }
    if (this.entityObj != null && this.entityObj.graphAnalysisInfo != null) {
      this.getGraphAnalysis2(this.entityObj.graphAnalysisInfo.ref.uuid, event.nodeType, degree, "", event.type, "", null, id, false);
    } else {
      this.getGraphByEntity(this.uuid, id, event.nodeType, degree, MetaType.GRAPHPOD, event.type || "", true, true);
    }
  }

  protected getGraphAnalysisByUuid(uuid: any):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.GRAPHANALYSIS, uuid, "").subscribe({
      next: (response: any) => {
        let graphanalysis = response;
        if (graphanalysis != null && graphanalysis.paramList != null) {
          let uuid = graphanalysis.paramList.ref.uuid;
          this.getParamListParam(uuid);
        } else {
          let body = { parmaListInfo: [], otherParams: null };
          const otherParams = new Map();
          otherParams.set("ENTITY_ID", this.id);
          body.otherParams = Object.fromEntries(otherParams);;
          this.getGraphAnalysis2(this.entityObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "");
        }
      }, error: (err: any) => { 
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("entity-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getParamListParam(uuid: string):void {
    const observableTemp = this.entityService.getParamListParam(uuid).subscribe({
      next: (response: any) => {
        console.warn(response)
        this.paramDialogList = response;
        let body = { parmaListInfo: [], otherParams: null };
        this.paramDialogList.forEach(element => {
          let item = {
            paramId: element.paramId,
            paramType: element.paramType,
            paramValue: this.entityObj,
            ref: element.ref
          }
          body.parmaListInfo.push(item);
        });
        const otherParams = new Map();
        otherParams.set("ENTITY_ID", this.id);
        body.otherParams = Object.fromEntries(otherParams);
        
        this.getGraphAnalysis2(this.entityObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "", false);
      },error: (err : any) => {
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("entity-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getGraphAnalysis2(uuid: string, nodeType: string, degree: string, startDate: string, edge: string, endDate: string, body?: any, nodeId?: string, isAppendMode?: boolean):void {
    const observableTemp = this.commonService.getGraphAnalysis2(uuid, "graphanalysis", nodeType, degree, startDate, edge, endDate, body, nodeId).subscribe({
      next: (response: GraphpodResultView) => {
        this.spinner.hide("entity-graph-analysis");
        this.graphReload = false;
        this.linkAnalysisResult = response;
        this.isLinkAnalysisInProgress = false;
        if(this.linkAnalysisResult.nodes == null && this.linkAnalysisResult.edges == null){
          this.isLinkAnalysisNoRecords = true;
        }
        else{
          this.isLinkAnalysisComplete = true;
        }
        this.isAppendMode = isAppendMode;
        this.isShowGraphAnalysis = true;
      },
      error: (err) => {
        this.spinner.hide("entity-graph-analysis");
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'
      }
    });
    this.addSubscribe(observableTemp);
  }

  //End Link Analyisis Tab

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  protected closeTab(){
    this.location.back()
  }

  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}

