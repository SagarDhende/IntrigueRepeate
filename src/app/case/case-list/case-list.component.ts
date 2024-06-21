import { Component, Input, ViewChild, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { LazyLoadEvent } from 'primeng/api';
import { Subject, Subscriber, Subscription, filter, switchMap } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { Router, ActivatedRoute, ParamMap, NavigationExtras, NavigationEnd } from '@angular/router'
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { Session } from 'src/app/login/auth.model';
import { SessionService } from 'src/app/shared/services/session.service';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { ICase } from 'src/app/shared/models/API/case.model';
import { Pagination } from 'src/app/shared/models/pagination.model';
import { INextConfig } from 'src/app/shared/models/next-config.model';
import { Sidebar } from 'primeng/sidebar';
import { TabView } from 'primeng/tabview';
import { AppConfigService } from 'src/app/app-config.service';
import { NextConfig } from 'src/app/app-config';
import { CaseService } from '../case.service';
import { CaseView } from '../case-view-model';
import { IFilterEntityId } from 'src/app/shared/models/API/filter-entity-id.model';
import { IFilterCase } from 'src/app/shared/models/API/filter-case-id.model';
import { IColsMap } from 'src/app/shared/models/cols-map.model';
import { ICaseTab } from 'src/app/shared/models/case-tab.model';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { HelperService } from 'src/app/shared/services/helper.service';
import { IEntity } from 'src/app/shared/models/API/entity.model';

@Component({
  selector: 'app-case-list',
  standalone: false,
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.scss'
})

export class CaseListComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarRef') public sidebarRef!: Sidebar;
  @ViewChild('rightAccordion') public accordion: SidebarAccordionComponent;
  @ViewChild('menu')public  menu: any;
  @ViewChild ('cardElementRef') protected cardElementRef:ElementRef;
  @ViewChild(TabView) public tabView: TabView;

  protected isEditEnable: boolean = true;
  protected allUserGroup: any;
  protected allUser: any;
  protected dashboardOverviewTabVisible: boolean = false;
  protected filteredLogs: any;

  protected isCasesNoRecords: boolean = false;
  protected isCasesComplete:  boolean = false;
  protected isCasesError: boolean = false;
  protected isCasesInProgress: boolean = false;

  protected selectedColumn:any;
  protected selectedCases:any;
  protected cols: IColStructure[];
  protected cases: ICase[];
  protected caseCol: any = [];
  protected pTableHeight: any;
  protected nextConfig: INextConfig;
  protected allEntities: IEntity[];
  protected allEntityIds: IFilterEntityId;
  protected allCaseName: ICase[]; 
  protected allCaseId: IFilterCase; 
  protected tabs: ICaseTab[] = [];
  protected value = '';
  protected entityTypeFilterMessage = "No Records Found";
  protected entityIdFilterMessage = "No Records Found";
  protected allCaseType = [{ name: 'AML' }, { name: 'FRAUD' }, { name: 'INTERNAL' }, { name: 'SCREENING' }];
  protected allStageType = [
    { name: 'Case Iniitiated' },
    { name: 'To be Assigned' },
    { name: 'Assigned to First Analyst' },
    { name: 'Assigned to Second Analyst' },
    { name: 'Review by First Analyst' },
    { name: 'Case Closed' },
    { name: 'Case Reopened' }
  ];
  protected searchCriteriaFormGroup: FormGroup = new FormGroup({
    owner: new FormControl(),
    userGroup: new FormControl(),
    stageType: new FormControl(),
    entityType: new FormControl(),
    entityId: new FormControl(),
    severity: new FormControl([]),
    // severity: new FormControl(),
    caseType: new FormControl(),
    caseName: new FormControl(),
    caseId: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl(),
    businessDate: new FormControl()
  });
  protected date: Date | undefined;
  protected active: 1;
  // protected breadcrumb: IBreadcrumb[];  
  // protected currentTabBreadcrumb: IBreadcrumb; 
  protected messageHead: string = '';
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected isPTableShow: boolean;
  protected colsMap: IColsMap = {   
    "Entity Type": "entity_type",
    "Entity Id": "entity_id",
    "Business Date": "business_date",
    "Case Id": "case_id",
    "Case Date": "rule_exec_time",
    "Case Score": "score",
    "Severity": "severity",
    "Status": "status",
    "Owner": "owner",
    "Group": "user_group",
    "Case Type":"case_type",
    "Stage":"stage"
  };  
  protected severityOptions: any[] = [
    {label: 'HIGH', value: 'HIGH'},
    {label: 'MEDIUM', value: 'MEDIUM'},
    {label: 'LOW', value: 'LOW'},
    {label: 'Info', value: 'INFO'}
   ];
   
  protected caseView: CaseView; 
  protected dateCheck: boolean;
  protected tabIndex: number;
  protected display: boolean = false;
  protected pagination: Pagination;
  protected isPaginator: boolean = false;
  protected caseNameFilterMessage = "No Records Found";
  protected caseIdFilterMessage = "No Records Found";
  protected items: ({ label: string; items: { label: string; icon: string; command: () => void; }[]; } | { label: string; items: ({ label: string; icon: string; url: string; routerLink?: undefined; } | { label: string; icon: string; routerLink: string; url?: undefined; })[]; })[];
  private _selectedColumns: any = [];
  private sortField: string = "";
  private sortOrderBy: string = "";
  private panelOpen: boolean = false;
  private subscriptions: Subscription[] = [];    //Array used for unsubscribing observables
  private entityIdSearchSub = new Subject<string>();

  constructor 
    ( 
      private caseService: CaseService, private appConfigService: AppConfigService,
      private spinner: NgxSpinnerService, private router: Router, 
      private route: ActivatedRoute, private commonService: CommonService,
      private sessionService: SessionService, 
      private helperService: HelperService
    ) 
  {
    this.nextConfig = NextConfig.config;
    this.dashboardOverviewTabVisible = this.appConfigService.dashboardOverviewTabVisible;
  }

  ngOnInit(): void {
    this.searchCriteriaFormGroup.get('entityId').disable()
    this.router.events.subscribe((event: any) => {
      if( event instanceof NavigationEnd || event.url){
        if(event.url.includes('cases')){
          this.tabIndex = 0
        }
      }
     });

    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'My Cases',
            icon: 'pi pi-user',
            command: () => {
              this.showMyCases();
            }
          },
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
    // this.breadcrumb = [{ title: 'Cases', url: '/case' }]
    this.cols = [
      { field: 'entity_type', header: 'Entity Type', visible: true },
      { field: 'entity_id', header: 'Entity Id', visible: true },
      { field: 'business_date', header: 'Business Date', minWidth: '6rem', visible: true },
      { field: 'case_type', header: 'Case Type', visible: true },
      { field: 'case_id', header: 'Case Id', minWidth: '18rem', visible: true },
      { field: 'rule_exec_time', header: 'Case Date', minWidth: '14rem', visible: true },
      { field: 'score', header: 'Case Score', visible: true },
      { field: 'owner', header: 'Owner', visible: true },
      { field: 'user_group', header: 'Group', visible: true },
      { field: 'status', header: 'Status', visible: true },
      { field: 'stage', header: 'Stage', minWidth: '12rem', visible: true },
      { field: 'severity', header: 'Severity', visible: true },
    ];
    this.caseCol = []
    this.selectedCases = this.cols;
    this.selectedColumn = this.cols;
    this.isCasesNoRecords = true;
    //this.pTableHeight = this.getPTableHeight();
    this.pagination = new Pagination(10, 0, 0);
    this.cases = [];
    this.sortField = "";
    this.sortOrderBy = "";
    this.caseView = new CaseView();
    // this.getAppConfigByApplication();

    this.tabIndex = 0;
    const sessionDetail: Session = this.sessionService.getData();
    let tempUser: any = {};
    tempUser.uuid = sessionDetail.userUuid;
    tempUser.name = sessionDetail.userName;

    // this.getUser(false);
    // this.getUserGroup(sessionDetail.userName);

    this.route.queryParamMap.subscribe({
      next: (params: ParamMap) => {
        if (Object.keys(params).length > 0 && params.get("type") == "user_group") {
          this.caseView.userGroup = params.get("owner");
          this.tabIndex = this.dashboardOverviewTabVisible == false ? 0 : 1;
          this.searchCriteriaFormGroup.controls['userGroup'].setValue({ name: params.get("owner") });
        }
        else if (Object.keys(params).length > 0 && params.get("type") == "user") {
          this.getUser(false);
          console.log(params.get("owner"));
          this.caseView.owner = params.get("owner");
          this.getUserGroup(this.caseView.owner);
          this.tabIndex = this.dashboardOverviewTabVisible == false ? 0 : 1;
        } else {
          console.log('owner not found in params')
          // this.searchCriteriaFormGroup.controls['owner'].setValue(tempUser);
          this.getUserGroup(sessionDetail.userName);
          this.getUser(false);
          this.tabIndex = this.dashboardOverviewTabVisible == false ? 0 : 1;
          this.getUserByUuidandVersion(tempUser.uuid);
        }
      }
    })
    this.getEntity();
    this.getCaseName();
    this.setIsEditFlag();

  this.entityIdSearchSub.pipe(
    filter(text => text.length >= 1),
    switchMap(searchTerm => this.caseService.postEntityId(searchTerm,this.searchCriteriaFormGroup.value.entityType?.name))
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
    this.onWindowRezie(null);
  }

  @HostListener('window:resize',['$event'])
  onWindowRezie(event:Event){
    if(this.tabIndex<1){
    let pTableHeightTemp = this.getPTableHeight();
    console.log(pTableHeightTemp);
    let cardHeight =this.cardElementRef.nativeElement.offsetHeight;
    let wrapperElements: HTMLCollection = document.getElementsByClassName('p-datatable-wrapper');
    Array.prototype.forEach.call(wrapperElements, function(wrapperElement) {
        let maxHeight = wrapperElement.style["max-height"];
        cardHeight=cardHeight-230;
        console.log(cardHeight);
        if(cardHeight < pTableHeightTemp) {
          wrapperElement.style["height"] = cardHeight+"px";
        }
        else{ 
        wrapperElement.style["height"] = pTableHeightTemp +"px";
        
        }
    }); 
  } 
  }
   /*  */
   @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  protected entityIdsChange(event: any): void {
    this.entityIdFilterMessage = "Loading";
    this.entityIdSearchSub.next(event.filter);
  }
  
  /* Mehtod to select new date object to search */
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

  /* method to change allEntityIds */
  protected entityTypeChange(): void {
    this.allEntityIds = undefined;
    if(this.searchCriteriaFormGroup.get('entityType').value)
    this.searchCriteriaFormGroup.get('entityId').enable()
    else
    this.searchCriteriaFormGroup.get('entityId').disable()
  }

  /* Show either data or errorMessage */
  protected getCaseName(): void {
    this.allCaseName = [];
    if (true) {
      this.caseNameFilterMessage = "Loading";
      const observableTemp = this.caseService.getCaseName(this.searchCriteriaFormGroup.value.caseType).subscribe({
        next: (response: any) => {
          this.allCaseName = response;
        }
      });
      this.addSubscribe(observableTemp);
    }
  }


  /* Thi is method to show either data or errorMessage */
  protected caseNameChange(event: any): void {
    if (this.searchCriteriaFormGroup.value.caseName) {
      this.caseNameFilterMessage = "Loading";
      let _caseView = new CaseView();
      _caseView.caseType = this.searchCriteriaFormGroup.value.caseType.name;
      _caseView.caseRuleName = this.searchCriteriaFormGroup.value.caseName.name;
      const observableTemp = this.caseService.getCaseAnalysisCriteria(_caseView, 0, 10, "", "").subscribe({
        next: (response: any) => {
          this.allCaseId = response.data;
          if (response.length == 0) {
            this.caseNameFilterMessage = "No Records Found";
          }
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  /* Thi is method to show either data or errorMessage */
  protected caseIdChange(event: any): void {
      this.caseIdFilterMessage = "Loading";
      const observableTemp = this.caseService.postCaseId(event.filter).subscribe({
        next: (response: any) => {
          this.allCaseId = response;
          console.log(JSON.stringify(response))
          if (response.length == 0) {
            this.caseIdFilterMessage = "No Records Found";
          }
        }
      });
      this.addSubscribe(observableTemp);
  }

  /* Method to to search selected values in form container */
  protected onSearch(searchStr:any) : void{
    this.filteredLogs = this.helperService.setSearchTerm(this.cases, searchStr);
    this.onWindowRezie(null);

  }
  
  /* If element is unchecked or checked it will go in array from newly created array thorugh filter. */
  protected onColumnSelectChange():void {
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

  /* Severity for background colors */
  protected getSeveritryCaption(severity: string): string {
    return this.appConfigService.getSeveritryCaption(severity);
  }

  protected getSeverityBGColor(severity: string): string {
    return this.appConfigService.getSeverityBGColor(severity)
  }

  /* anonymous method to open filter panle */
  protected openFilerPanel = function () {
    this.display = true;
  }

  /* to toggle it */
  protected panelToggle(): void {
    if (this.panelOpen) {
      this.panelClose();
    }
    else {
      this.isPTableShow = false;
      this.accordion.open('all', 0);
      this.panelOpen = true;
      setTimeout(() => {
        this.isPTableShow = true;
      }, 1000)
    }
  }

  /* to close panel */
  protected panelClose(): void {
    this.accordion?.close('right');
    this.panelOpen = false;  
  }

  /* to have pagination */
  protected paginate(event):void {
    this.spinner.show("case-analysis-list");
    this.pagination.offset = event['first']
    this.getCaseAnalysisCriteria(this.caseView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    this.isPaginator = true;
  }

  /* method to select values from owner dropdown */
  protected ownerChange(): void {
    /* if name property and owner value are undefined then store empty */
    let tempUser = ((this.searchCriteriaFormGroup.value.owner || {}).name) || "";
    if (tempUser != null && tempUser != "") {
      this.getUserGroup(tempUser);
    }
  }

  /* custom sort */
  protected customSort(event: LazyLoadEvent):void {
    if (typeof event != 'undefined' && typeof event['sortField'] != 'undefined') {
      this.sortField = this.colsMap[event['sortField']]
      this.spinner.show("entity-detail");
      this.sortOrderBy = event.sortOrder == 1 ? 'ASC' : 'DESC';
      this.getCaseAnalysisCriteria(this.caseView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    }
  }

   /* Click to submit to search */
   protected submitSearchCriteria(): void {
    console.log(this.searchCriteriaFormGroup.value.owner);
    this.caseView.entityType = ((this.searchCriteriaFormGroup.value.entityType || {}).name) || "";
    this.caseView.entityId = ((this.searchCriteriaFormGroup.value.entityId || {}).value) || "";
    this.caseView.caseType = ((this.searchCriteriaFormGroup.value.caseType || {}).name) || "";
    this.caseView.caseRuleName = ((this.searchCriteriaFormGroup.value.caseName || {}).name) || "";
    this.caseView.caseRuleId = ((this.searchCriteriaFormGroup.value.caseId || {}).case_id) || "";
    // this.caseView.severity = this.searchCriteriaFormGroup.value.severity != null ? this.searchCriteriaFormGroup.value.severity.toString() : "";
    if (this.searchCriteriaFormGroup.value.severity) {
      this.caseView.severity = this.searchCriteriaFormGroup.get('severity').value.join(',');
   } else {
      this.caseView.severity = '';
   }
  
    if (this.searchCriteriaFormGroup.value.startDate) {
      //let sDate = new Date(this.searchCriteriaFormGroup.value.startDate.year, this.searchCriteriaFormGroup.value.startDate.month, this.searchCriteriaFormGroup.value.startDate.day);
      //this.caseView.startTime = (sDate.getFullYear() + '-' + sDate.getMonth().toString().padStart(2, "0") + '-' + sDate.getDate().toString().padStart(2, "0")) || "";
      this.caseView.startTime = this.searchCriteriaFormGroup.value.startDate
    }
    if (this.searchCriteriaFormGroup.value.endDate) {
      //let eDate = new Date(this.searchCriteriaFormGroup.value.endDate.year, this.searchCriteriaFormGroup.value.endDate.month, this.searchCriteriaFormGroup.value.endDate.day);
      //this.caseView.endTime = (eDate.getFullYear() + '-' + eDate.getMonth().toString().padStart(2, "0") + '-' + eDate.getDate().toString().padStart(2, "0")) || "";
      this.caseView.endTime = this.searchCriteriaFormGroup.value.endDate
    }
    if (this.searchCriteriaFormGroup.value.businessDate) {
      //let bDate = new Date(this.searchCriteriaFormGroup.value.businessDate.year, this.searchCriteriaFormGroup.value.businessDate.month, this.searchCriteriaFormGroup.value.businessDate.day);
      //this.caseView.businessDate = (bDate.getFullYear() + '-' + bDate.getMonth().toString().padStart(2, "0") + '-' + bDate.getDate().toString().padStart(2, "0")) || "";
      this.caseView.businessDate = this.searchCriteriaFormGroup.value.businessDate
    }
    // this.caseView.severity = this.searchCriteriaFormGroup.value.severity != null ? this.searchCriteriaFormGroup.value.severity.toString() : '';
    this.caseView.action = 'view';
    this.caseView.owner = ((this.searchCriteriaFormGroup.value.owner || {}).name) || "";
    this.caseView.userGroup = ((this.searchCriteriaFormGroup.value.userGroup || {}).name) || "";
    this.caseView.stageType = ((this.searchCriteriaFormGroup.value.stageType || {}).name) || "";
    console.log(this.searchCriteriaFormGroup.value);
    //this.listFetched = false;
    //this.pTableHeight = this.getPTableHeight();
    this.setIsEditFlag()
    this.pagination = new Pagination(10, 0, 0);
    this.getCaseAnalysisCriteria(this.caseView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    this.panelClose();
  }

  /* Clear all searched data */
  protected clearAll(): void {
      this.searchCriteriaFormGroup.get('entityId').disable()
      this.isEditEnable = false
      this.caseView = new CaseView();
      this.searchCriteriaFormGroup.reset();
      this.submitSearchCriteria();
      this.panelClose();

  }

  /* open in deatil page */
  protected openCase(item): void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "case_id": item.case_id,
        "rule_name": item.rule_name,
      }
    }
    this.router.navigate(["/case/case-details"], navigationExtras);
  }

  /* Spinner */
  protected refreshClick(): void {
    //this.listFetched = false;
    //this.pTableHeight = this.getPTableHeight();
    this.sortField = "";
    this.sortOrderBy = "";
    //this.listFetched = false;
    this.getCaseAnalysisCriteria(this.caseView, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy);
    this.panelClose();
  }
    /*  */
    protected async openDetailsTab(data: any):Promise<void> {
      this.panelClose();
      data.shortName = 'Case-' + data.case_id.slice(0, 8) + '-xxx';
      if (!this.tabs.includes(data)) {
        this.tabs.push(data)
        await new Promise(f => setTimeout(() => {
          let tempIndex = this.dashboardOverviewTabVisible == true ? this.tabs.length + 1 : this.tabs.length;
          this.tabIndex = tempIndex;
          // this.currentTabBreadcrumb = { title: data.case_id, url: false };
          // this.breadcrumb.pop();
          // this.breadcrumb.push(this.currentTabBreadcrumb);
        }, 500));
      } else {
        let tempIndex = this.dashboardOverviewTabVisible == true ? 2 : 1;
        this.tabIndex = this.tabs.indexOf(data) + tempIndex;
      }
    }
  
    /*  */
    protected async tabClosed(event: any):Promise<void> {
      let shortName = '';
      this.panelClose();
      await new Promise(f => setTimeout(() => {
        this.tabIndex = this.dashboardOverviewTabVisible == true ? 1 : 0;
        let tempIndex = this.dashboardOverviewTabVisible == true ? 2 : 1;
        this.tabs.splice(event.index - tempIndex, 1);
      }, 10));
    }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter((col: any) => val.includes(col));
    console.log("selectedColum", this._selectedColumns)
  }


  /* getCaseAnalysisCriteria for table */
  private getCaseAnalysisCriteria(caseView: any, offset: number, limit: number, sortBy: string, sortOrderBy: string):void {
    this.cases = [];
    this.filteredLogs = [];
    this.isCasesComplete = false;
    this.isCasesInProgress = true
    this.isCasesNoRecords = false
    this.isCasesError = false;
    this.spinner.show("case-analysis-list");
    //this.listFetched = false;
    const observableTemp = this.caseService.getCaseAnalysisCriteria(caseView, offset, limit, sortBy, sortOrderBy).subscribe({
      next: (response) => {
        if(response.data.length == 0 || response == null || response.data == undefined || response.data == null){
          this.isCasesNoRecords = true
        }
        this.cases = [];
        this.tabs = [];
        this.cases = response.data;
        this.filteredLogs = this.cases;
        this.onWindowRezie(null);
        this.isCasesComplete = true;
        this.isCasesInProgress = false
        this.pagination.totalRecords = response.meta.count;
        this.spinner.hide("case-analysis-list");
        //this.listFetched = true;
        this.isPTableShow = true;
        this._selectedColumns = response.data;
        //this.pTableHeight = this.getPTableHeight();
      },
      error: (err) => {
        this.spinner.hide("case-analysis-list");
        this.isCasesInProgress = false
        this.isCasesError = true;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  /* Dropdown API */
  private getUser(isDefault: any): any {
    const observableTemp = this.commonService.getUserByOrg(MetaType.USER).subscribe({
      next: (response) => {
        this.allUser = response;
        const sessionDetail: Session = this.sessionService.getData();
        if (this.allUser != null && this.allUser.length > 0) {
          for (let i = 0; i < this.allUser.length; i++) {
            /* if the name of the current user (this.allUser[i].name) matches the sessionDetail.userName */
            if (this.allUser[i].name == sessionDetail.userName) {
              if (isDefault) {
                /* it sets the value of owner tp the current user allUser[i] */
                this.searchCriteriaFormGroup.controls['owner'].setValue(this.allUser[i]);
                break;
              }
            }
          }
        }
      }, error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  /* Dropdown group  */
  private getUserGroup(userName: any): void {
    this.allUserGroup = [];
    const observableTemp = this.commonService.getUserGroupByUserName(MetaType.USERGROUP, userName).subscribe({
      next: (response) => {
        this.allUserGroup = response;
      }, error: (response) => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getEntity(): void {
    this.entityTypeFilterMessage = "Loading";
    const observableTemp = this.caseService.getEntity().subscribe({
      next: (response: any) => {
        console.log(response,'Entitytype case');
        
        this.allEntities = response;
        if (!this.allEntities || !this.allEntities.length) {
          this.entityTypeFilterMessage = "No Records Found";
        }
      }
    })
    this.addSubscribe(observableTemp);
  }


  /* to increase the height of table conditionaly */
  /*private getPTableHeight() {
    if (this.cases != null && this.cases.length == 0) {
      return "90px";
    }
    else if (this.cases != null && this.cases.length == 0) {
      return "600px";
    }
    else if (this.cases != null) {
      if (this.cases.length < 10) {
        return (this.cases.length * 40) + 50 + "px"
      } else {
        return "600px"
      }
    }
    return false;
  }*/

  private getPTableHeight() {
    if (this.filteredLogs != null && this.filteredLogs.length == 0) {
      return "103";
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

  /*  */
  private showMyCases(): void {
    const sessionDetail: Session = this.sessionService.getData();
    let tempUser: any = {};
    tempUser.uuid = sessionDetail.userUuid;
    tempUser.name = sessionDetail.userName;
    this.searchCriteriaFormGroup.controls['owner'].setValue(tempUser);
    this.getUserGroup(sessionDetail.userName);
    this.caseView.owner = this.searchCriteriaFormGroup.value.owner.name;
    this.getUser(true);
    this.tabIndex = this.dashboardOverviewTabVisible == false ? 0 : 1;
    //this.listFetched = false;
    this.router.navigate([], {
      queryParams: {
        'owner': null,
        'type': null,
      },
      queryParamsHandling: 'merge'
    })
  }

  private getUserByUuidandVersion(uuid: string):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.USER, uuid, '').subscribe({
      next: (response) => {
        if (response != null && response.userGroupInfo != null && response.userGroupInfo.length > 0) {
          this.caseView.userGroup = response.userGroupInfo[0].ref.name;
          this.searchCriteriaFormGroup.controls['userGroup'].setValue({ name: this.caseView.userGroup });
        } else {
          const sessionDetail: Session = this.sessionService.getData();
          let tempUser: any = {};
          tempUser.uuid = sessionDetail.userUuid;
          tempUser.name = sessionDetail.userName;
          this.searchCriteriaFormGroup.controls['owner'].setValue(tempUser);
          this.caseView.owner = this.searchCriteriaFormGroup.value.owner.name;
        }
      },
      error: (response) => {

      }
    });
    this.addSubscribe(observableTemp);
  }


  /* subscriptions in loop */
  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  private setIsEditFlag(): void
  {
   let searchCriteriaFormValues = this.searchCriteriaFormGroup.value
   Object.values(searchCriteriaFormValues).forEach(value =>{
    if(value != null){
      this.isEditEnable = true
    }
   })
  } 

  /* destroy subscription */ 
  ngOnDestroy() {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }


 

}