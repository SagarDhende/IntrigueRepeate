import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subject, Subscriber, Subscription,  filter, switchMap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { TabView } from 'primeng/tabview';
import { LazyLoadEvent,MenuItem } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';

import { CommonService } from 'src/app/shared/services/common.service';
import { AlertService } from '../alert.service';
import { AppConfigService } from 'src/app/app-config.service';
import { HelperService } from 'src/app/shared/services/helper.service';

import { AlertView } from '../alert-view-model';
import { IAlert } from 'src/app/shared/models/API/alert.model';
import { IBreadcrumb } from 'src/app/shared/models/breadcrumb.model';
import { Pagination } from 'src/app/shared/models/pagination.model';
import { IEntity } from 'src/app/shared/models/API/entity.model';
import { IFilterEntityId } from 'src/app/shared/models/API/filter-entity-id.model';
import { IFilterAlertId } from 'src/app/shared/models/API/filter-alert-id.model';
import { IAlertTab } from 'src/app/shared/models/alert-tab.model';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';

interface Status {
  name: string;
  value: string;
}


interface IAlertRow {
  field: string,
  header: string,
  minWidth?: string,
  visible: boolean,
  controlType?:any
}
@Component({
  selector: 'app-alert-list',
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.scss'
})

export class AlertListComponent {
  protected allUser: any;

  constructor(private alertService: AlertService, private appConfigService: AppConfigService, private router: Router,
    private spinner: NgxSpinnerService, private helperservice: HelperService,private commonService:CommonService) {
  }

  @ViewChild('rightAccordion') public accordion: SidebarAccordionComponent;
  @ViewChild ('cardElementRef') protected cardElementRef:ElementRef;
  @ViewChild(TabView) public tabView: TabView;
  
  protected isEditEnable: boolean = false;
  protected isOpen: boolean = false;
  protected isClose: boolean = false
  protected isActionDisabled: boolean = false
  protected selectedCases: any
  protected selectedColumn: any;
  protected listFetched: boolean = false;
  protected listError: boolean = false;
  protected pTableHeight: any;
  protected pagination: Pagination;
  protected filteredLogs: any;
  protected messageHead: string = '';
  protected dashboardId: string = null;
  protected isDashboardRender: boolean = false;
  protected dateCheck: boolean;
  protected entityTypeFilterMessage = "";
  protected alertNameFilterMessage = "No Records Found";
  protected entityIdFilterMessage = "No Records Found";
  protected tabIndex: any;
  protected alertIdFilterMessage = "No Records Found";
  protected dashboardSpinner: boolean = true
  // protected breadcrumb: IBreadcrumb[];
  protected cols: IAlertRow[];
  protected alerts: IAlert[];
  protected allEntities: IEntity[];
  protected allAlertNames: IEntity[];
  protected allEntityIds: IFilterEntityId;
  protected allAlertIds: IFilterAlertId[] = [];
  protected activeTab: 1;
  protected tabs: IAlertTab[] = [];
  protected panelOpen: boolean = false;
  protected value: string = '';
  protected items: { label: string; items: { label: string; icon: string; command: () => void; }[]; }[];
  protected severityOptions: Status[] = [
    { name: 'High', value: 'HIGH' },
    { name: 'Medium', value: 'MEDIUM' },
    { name: 'Low', value: 'LOW' },
    { name: 'Info', value: 'INFO' },
  ];
  protected searchCriteriaFormGroup: FormGroup = new FormGroup({
    entityType: new FormControl(),
    entityId: new FormControl(),
    alertName: new FormControl(),
    alertId: new FormControl(),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    severity: new FormControl(),
    stageType:new FormControl(),
    owner :new FormControl(),
  })
  protected tooltipObj = {};
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  

  protected selectedAlert:any;
  protected isActionDialog:boolean=false;
  protected actionForm:FormGroup=new FormGroup({
    status:new FormControl(),
    owner:new FormControl()
  });
  actionButtonLoading:boolean=false;
  protected allStatus=[];
  protected allStageType = [
    { name: 'Iniitiated' },
    { name: 'Assigned' },
    { name: 'Closed' },
    { name: 'Re-opened'}
  ];

  private alertView: AlertView
  private sortField: string = "";
  private sortOrderBy: string = "";
  private dashboardOverviewTabVisible: boolean = false;
  private currentTabBreadcrumb: IBreadcrumb;
  
  /*
  @discription- array used for unsubscribing observables
  */
  private subscriptions: Subscription[] = [];

  private searchSub = new Subject<string>();
  private entityIdSearchSub = new Subject<string>();

  ngOnInit(): void {
    this.searchCriteriaFormGroup.get('entityId').disable()
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd || event.url) {
        if (event.url.includes('alerts')) {
          this.tabIndex = 0
        }
      }
    });

    this.getUser();
    // this.breadcrumb = [{ title: 'Alerts', url: '/alert' }];
    this.items = [
      {
        label: 'Options',
        items: [

          {
            label: 'Edit Filter',
            icon: 'pi pi-plus',
            command: () => {
              this.panelToggle();
            }
          },
          {
            label: 'Clear filter',
            icon: 'pi pi-times',
            command: () => {
              this.clearAll();
            }
          }
        ]
      },
    ];
    this.cols = [
      { field: 'select', header: '', visible: true,controlType:"checkbox"},
      { field: 'entity_type', header: 'Entity Type', visible: true },
      { field: 'entity_id', header: 'Entity Id', visible: true },
      { field: 'business_date', header: 'Business Date', minWidth: '8rem', visible: true },
      { field: 'alert_id', header: 'Alert Id', minWidth: '18rem', visible: true },
      { field: 'rule_name', header: 'Alert Name', minWidth: '18rem', visible: true },
      { field: 'rule_exec_time', header: 'Alert Date', minWidth: '18rem', visible: true },
      { field: 'score', header: 'Alert Score', visible: true },
      { field: 'owner', header: 'Owner', visible: true },
      { field: 'status', header: 'Status', visible: true },
      { field: 'stage', header: 'Stage', visible: true },
      { field: 'severity', header: 'Severity', visible: true },
      // { field: 'Action', header: 'Action' }
    ];
    // this.selectedCases = this.cols;
    this.selectedCases = this.cols.filter(col => col.field !== 'select');
    this.selectedColumn = this.cols
   // this.pTableHeight = this.getPTableHeight();
    this.pagination = new Pagination(10, 0, 0);
    this.alerts = [];
    this.sortField = "";
    this.sortOrderBy = "";

    this.alertView = new AlertView();
    this.tabIndex = 0;
    if (this.dashboardOverviewTabVisible) {
      this.getAppConfigByApplication();
    } else {
      this.refreshClick();
    }

  
    this.searchSub.pipe(
      filter(text => text.length >= 1),
      switchMap(searchTerm => this.alertService.postAlertId(searchTerm))
    ).subscribe({
      next: (response: any) => {
        this.allAlertIds = response;
        if (response.length === 0) {
          this.alertIdFilterMessage = "No Records Found";
        } else {
          this.alertIdFilterMessage = "";
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
    
    this.entityIdSearchSub.pipe(
      filter(text => text.length >= 1),
      switchMap(searchTerm => this.alertService.postEntityId(searchTerm,this.searchCriteriaFormGroup.value.entityType?.name))
    ).subscribe({
      next: (response: any) => {
        this.allEntityIds = response;
        if (response.length == 0) {
          this.entityIdFilterMessage = "No Records Found";
        } else {
          this.entityIdFilterMessage = "";
        }
      }, error: (error) => {
        console.error('Error fetching data:', error)
      }
    })
  }

  ngAfterViewInit(): void {
  
  }

  
  protected showTooltip(alertId: string, span: HTMLElement): void {
    if (span.offsetWidth + 28 > span.clientWidth) {
      this.tooltipObj[alertId] = true;
    }
  }
  
  protected shortenText(text: string): string {
    let short = '';
    if (text != null) {
      if (text.length > 32) {
        short = text.substring(0, 32) + '...';
        this.tooltipObj[text] = text;
      } else {
        short = text;
      }
    }
    return short;
  }

  protected alertIdChange(event: any): void {
    this.alertIdFilterMessage = "Loading";
    this.searchSub.next(event.filter);
  }

  protected entityIdsChange(event: any): void {
    this.entityIdFilterMessage = "Loading";
    this.entityIdSearchSub.next(event.filter);
  }

  @HostListener('window:resize',['$event'])
  onWindowRezie(event:Event){
    if(this.tabIndex<1){
      let pTableHeightTemp = this.getPTableHeight();
      let cardHeight = this.cardElementRef.nativeElement.offsetHeight;
      let wrapperElements: HTMLCollection = document.getElementsByClassName('p-datatable-wrapper');
      Array.prototype.forEach.call(wrapperElements, function (wrapperElement) {
        let maxHeight = wrapperElement.style["max-height"];
        cardHeight = cardHeight - 230;
        if (cardHeight < pTableHeightTemp) {
          wrapperElement.style["height"] = cardHeight + "px";
        }
        else {
          wrapperElement.style["height"] = pTableHeightTemp + "px";
  
        }
      });
    }
  }

  protected actionClick() {
    this.isActionDialog = true;
    this.actionForm.reset();
  }

  protected onSubmitAction() {
    console.log(this.actionForm.value.status);
    this.actionButtonLoading = true;
    let alertIdTemp = this.selectedAlert.map((item: any) => {
      return item.alert_id
    }).join(',');
    console.log(alertIdTemp);
    this.alertService.alertAction(alertIdTemp, this.actionForm.value.owner || "", this.actionForm.value.status || "").subscribe({
      next: (response: any) => {
        this.isActionDialog = false;
        this.actionButtonLoading = false;
        this.actionForm.reset();
        this.refreshClick();
      },
      error: (response: any) => {
        this.isActionDialog = false;
        this.actionButtonLoading = false;
        this.actionForm.reset();

      }
    })
  }

  protected getSevertyStatusCaption(status: string): any {
    return this.appConfigService.getNodificationStatusCaption(status);
  }
  protected getSeveritryCaption(severity: string): any {
    return this.appConfigService.getSeveritryCaption(severity);
  }
  protected paginate(event: any): void {
    this.spinner.show("alert-analysis-list")
    this.pagination.offset = event['first']
    this.getAlertAnalysisCriteria(this.alertView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
  }
  protected customSort(event: LazyLoadEvent) {
    if (typeof event != 'undefined' && typeof event['sortField'] != 'undefined') {
      this.sortField = event['sortField']
      this.sortOrderBy = event.sortOrder == 1 ? 'ASC' : 'DESC';
      this.getAlertAnalysisCriteria(this.alertView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    }
  }

  protected entityTypeChange(): any {
    this.allEntityIds = undefined;
    if (this.searchCriteriaFormGroup.get('entityType').value)
      this.searchCriteriaFormGroup.get('entityId').enable()
    else
      this.searchCriteriaFormGroup.get('entityId').disable()
  }

  protected tabChange(): void {
    this.panelClose();
    if (this.tabIndex <= 1) {
      this.currentTabBreadcrumb = { title: this.tabView?.tabs[this.tabIndex].header, url: false };
      // this.breadcrumb.pop();
      // this.breadcrumb.push(this.currentTabBreadcrumb);
    }
    if (this.tabIndex == 1 && !this.listFetched && this.dashboardOverviewTabVisible) {
      this.getEntity();
      this.getAlertName();
      this.getAlertAnalysisCriteria(this.alertView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    }
    else if (this.tabIndex == 0 && !this.listFetched && !this.dashboardOverviewTabVisible) {
      this.getEntity();
      this.getAlertName();
      this.getAlertAnalysisCriteria(this.alertView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    }
    else {
      if (this.tabs.length > 0) {
        let tempTabIndex = this.tabIndex == 0 ? 0 : this.tabIndex - 2;
        this.currentTabBreadcrumb = { title: this.tabs[tempTabIndex].alert_id, url: false };
        // this.breadcrumb.pop();
        // this.breadcrumb.push(this.currentTabBreadcrumb);
      }
    }
  }

  protected async openDetailsTab(data: any) {
    data.shortName = 'Alert-' + data.alert_id.slice(0, 8) + '-xxx';
    this.panelClose();
    if (!this.tabs.includes(data)) {
      this.tabs.push(data);
      await new Promise(f => setTimeout(() => {
        let tempIndex = this.dashboardOverviewTabVisible == true ? this.tabs.length + 1 : this.tabs.length;
        this.tabIndex = tempIndex;
        this.currentTabBreadcrumb = { title: data.alert_id, url: false };
        // this.breadcrumb.pop();
        // this.breadcrumb.push(this.currentTabBreadcrumb);
      }, 500));
    } else {
      let tempIndex = this.dashboardOverviewTabVisible == true ? 2 : 1;
      this.tabIndex = this.tabs.indexOf(data) + tempIndex;
    }
  }
  protected async tabClosed(event: any): Promise<void> {
    this.panelClose();
    await new Promise(f => setTimeout(() => {
      this.tabIndex = this.dashboardOverviewTabVisible == true ? 1 : 0;
      let tempIndex = this.dashboardOverviewTabVisible == true ? 2 : 1;
      this.tabs.splice(event.index - tempIndex, 1);
    }, 10));
  }

  protected panelClose(): void {
    this.accordion?.close('right');
    this.panelOpen = false;
  }
  protected panelToggle(): void {
    if (this.panelOpen) {
      this.panelClose();
    }
    else {
      this.accordion.open('all', 0);
      this.panelOpen = true;
    }
  }
  protected clearAll(): void {
    this.searchCriteriaFormGroup.get('entityId').disable()
    this.isEditEnable = false
    this.alertView = new AlertView();
    this.searchCriteriaFormGroup.reset();
    this.submitSearchCriteria();
    this.panelClose();
  }
  protected refreshClick(): void {
    //this.pTableHeight = this.getPTableHeight();
    this.selectedAlert = [];
    this.alerts = [];
    this.sortField = "";
    this.sortOrderBy = "";
    this.listFetched = false;
    this.listError = false;;
    this.tabChange();
    this.panelClose();
  }

  protected onColumnSelectChange(): void {
    const uncheckedColumns = this.selectedCases.filter(
      (col: any) => !this.selectedColumn.includes(col)
    );
    const checkedColumns = this.selectedCases.filter(
      (col: any) => this.selectedColumn.includes(col)
    );

    uncheckedColumns.forEach((col: any) => {
      col.visible = false
    })
    checkedColumns.forEach((col: any) => {
      col.visible = true
    })

  }

  protected dateChange(): void {
    if (this.searchCriteriaFormGroup.value.startDate && this.searchCriteriaFormGroup.value.endDate) {
      const date1: any = new Date(this.searchCriteriaFormGroup.value.startDate.year, this.searchCriteriaFormGroup.value.startDate.month - 1, this.searchCriteriaFormGroup.value.startDate.day);
      const date2: any = new Date(this.searchCriteriaFormGroup.value.endDate.year, this.searchCriteriaFormGroup.value.endDate.month - 1, this.searchCriteriaFormGroup.value.endDate.day);
      if (date2 < date1) {
        this.dateCheck = true;
      }
      else {
        this.dateCheck = false;
      }
    }
  }
  protected onSearch(searchStr: any): void {
    this.filteredLogs = this.helperservice.setSearchTerm(this.alerts, searchStr);
    this.onWindowRezie(null);
  }


  private submitSearchCriteria(): void {
    this.alertView.entityType = ((this.searchCriteriaFormGroup.value.entityType || {}).name) || '';
    this.alertView.entityId = ((this.searchCriteriaFormGroup.value.entityId || {}).value) || '';
    this.alertView.alertName = ((this.searchCriteriaFormGroup.value.alertName || {}).name) || '';
    this.alertView.alertId = ((this.searchCriteriaFormGroup.value.alertId || {}).alert_id) || '';
    this.alertView.owner = ((this.searchCriteriaFormGroup.value.owner || {}).name) || '';
    this.alertView.stageType = ((this.searchCriteriaFormGroup.value.stageType || {}).name) || '';

    this.alertView.severity = this.searchCriteriaFormGroup.value.severity != null ? this.searchCriteriaFormGroup.value.severity.toString() : '';
    if (this.searchCriteriaFormGroup.value.startDate) {
      this.alertView.startTime = this.searchCriteriaFormGroup.value.startDate
    }
    //this.alertView.severity = this.getSeverity()
    if (this.searchCriteriaFormGroup.value.endDate) {
      this.alertView.endTime = this.searchCriteriaFormGroup.value.endDate
    }

    this.setIsEditFlag()
    this.alertView.action = 'view';
    this.pagination = new Pagination(10, 0, 0);
    this.getAlertAnalysisCriteria(this.alertView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    this.panelClose();
  }

  private getSeverity(): string {
    let severity = "";
    let tempSeverityList = this.searchCriteriaFormGroup.get('severity').value;
    if (tempSeverityList != null && tempSeverityList.length > 0) {
      for (let i = 0; i < tempSeverityList.length; i++) {
        severity += tempSeverityList[i].name + ",";
      }
      severity.slice(0, -1);
    }
    return severity;
  }

  private setIsEditFlag(): void {
    let searchCriteriaFormValues = this.searchCriteriaFormGroup.value
    Object.values(searchCriteriaFormValues).forEach(value => {
      if (value != null) {
        this.isEditEnable = true
      }
    })
  }

  private getEntity(): void {
    this.entityTypeFilterMessage = "Loading";
    const observableTemp = this.alertService.getEntity().subscribe({
      next: (response: any) => {
        this.allEntities = response;
        if (!this.allEntities || !this.allEntities.length) {
          this.entityTypeFilterMessage = "No Records Found";
        }
      }
    })
    this.addSubscribe(observableTemp);
  }

  private getAlertName(): void {
    this.alertNameFilterMessage = "Loading"
    const observableTemp = this.alertService.getAlertName().subscribe({
      next: (response: any) => {
        this.allAlertNames = response;
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAlertAnalysisCriteria(alertView: AlertView, offset: number, limit: number, sortBy: string, sortOrderBy: string): any {
    this.spinner.show("alert-analysis-list")
    this.alerts = [];
    this.filteredLogs = []
    this.listFetched = false;
    const observableTemp = this.alertService.getAlertAnalysisCriteria(alertView, offset, limit, sortBy, sortOrderBy).subscribe({
      next: (response) => {
        this.tabs = [];
          this.pagination.totalRecords = response.meta.count
          //this.pTableHeight = this.getPTableHeight();
          this.alerts = response.data;
          this.filteredLogs = this.alerts;
          this.listFetched = true;
          this.spinner.hide("alert-analysis-list"); 
          this.onWindowRezie(null);
      },
      error: (err) => {
        this.spinner.hide("alert-analysis-list");
        this.listError = true;
        // this.errorTitle = 'Operation Failed';
        // this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getPTableHeight() {
    if (this.filteredLogs != null && this.filteredLogs.length == 0) {
      return "103";
    }
    else if (this.listFetched && this.filteredLogs != null && this.filteredLogs.length == 0) {
      return "562";
    }
    else if (this.filteredLogs != null) {
      if (this.filteredLogs.length <= 10) {
        return (this.filteredLogs.length * 51) + 52;
      } else {
        return "562"
      }
    }
    return false
  }

  private getAppConfigByApplication(): void {
    const observableTemp = this.alertService.getAppConfigByApplication().subscribe({
      next: (response: any) => {
        if (response != null && response.configInfo != null && response.configInfo.length > 0) {
          const result = response.configInfo.reduce((obj, cur) => (
            {
              ...obj, [cur.configName]: cur.configVal
            }), {});
          this.dashboardId = result["alert.dashboard.uuid"];

          if (this.dashboardId != null || typeof this.dashboardId != 'undefined') {
            this.isDashboardRender = true;
          }
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  private getUser(): void {
    const observableTemp = this.commonService.getUserByOrg(MetaType.USER).subscribe({
      next: (response: any) => {
        this.allUser = response;
      }, error: (response: any) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
  ngOnDestroy() {
    //Method used for unsubscribing observables
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  protected setStatusArr(): void {
    this.isOpen = false;
    this.isClose = false;
    this.setDynamicOptions()
    this.allStatus = []
    this.isActionDisabled = false
    this.setStatus()
  }

  private setStatus(): void {
    if (this.isOpen && this.isClose) {
      this.isActionDisabled = true
    }
    else if (this.isClose) {
      this.allStatus.push({ "name": "Open", "value": "OPEN" })
    }
    else if (this.isOpen) {
      this.allStatus.push({ "name": "Close", "value": "CLOSED" })
    }
  }

  private setDynamicOptions(): void {
    this.selectedAlert.forEach(alert => {
      if (alert.status == 'OPEN') {
        this.isOpen = true
      }
      else if (alert.status == 'CLOSED') {
        this.isClose = true
      }
    })
  }

}